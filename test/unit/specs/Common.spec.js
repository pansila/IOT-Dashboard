import {LineParser, LineBuffer, TimestampPrefix, KeywordFilter} from '@utils/Common.js'
import str from 'string-to-stream'
import ansi from 'ansi-styles'
import {sprintf} from 'sprintf-js'

describe('Test utilities in Common.js', () => {
  describe('LineParser should replace line marks correctly', () => {
    describe('1. \\n\\r -> \\r\\n', () => {
      it('1. Basic test', function (done) {
        const lineSrc = '\n\r\r\n\n\r1\n\r\n\n\r\r\r\n\r'
        const lineDst = '\r\n\r\n\r\n1\r\n\n\r\n\r\r\n\r'
        let result = ''

        str(lineSrc).pipe(new LineParser(false, false)).on('data', data => {
          result += data
        }).on('end', () => {
          expect(result).to.equal(lineDst)
          done()
        })
      })

      it('2. Mixed test', function (done) {
        const lineSrc = '1\n\r\n\r\n\r2'
        const lineDst = '1\r\n\r\n\r\n2'
        let result = ''

        str(lineSrc).pipe(new LineParser(false, false)).on('data', data => {
          result += data
        }).on('end', () => {
          expect(result).to.equal(lineDst)
          done()
        })
      })
    })

    describe('2. line starts and ends with \\r', () => {
      it('1. basic test', function (done) {
        const lineSrc = '\r\r\r\n\n1\r2\n3\n\r4\r'
        const lineDst = '\r\n\r\n\r\n\r\n1\r\n2\r\n3\r\n4\r\n'
        let result = ''

        str(lineSrc).pipe(new LineParser(true, true)).on('data', data => {
          result += data
        }).on('end', () => {
          expect(result).to.equal(lineDst)
          done()
        })
      })
    })

    describe('3. line starts and ends with \\n', () => {
      it('1. basic test', function (done) {
        const lineSrc = '\n\n\n\r1\n\n\r\n2\n\n'
        const lineDst = '\r\n\r\n\r\n1\r\n\r\n\r\n2\r\n\r\n'
        let result = ''

        str(lineSrc).pipe(new LineParser(true, true)).on('data', data => {
          result += data
        }).on('end', () => {
          expect(result).to.equal(lineDst)
          done()
        })
      })
    })
  })

  describe('LineBuffer should buffer all strings within a period of time', () => {
    it('1. Basic test', function (done) {
      const lineSrc = ['123\r\n', '\r\n', '123']
      const lineDst = ['123\r\n', '\r\n', '123']
      let lines = []
      let tests = []

      str.prototype._read = function () {
        if (!this.ended) {
          var self = this
          process.nextTick(function () {
            self.push(self._str)
          })
          setTimeout(() => self.push(null), 100)
          this.ended = true
        }
      }

      lineSrc.forEach(d => {
        let result = ''
        const lineBuffer = new LineBuffer()
        tests.push(new Promise((resolve, reject) => {
          str(d).pipe(lineBuffer).on('data', line => {
            result += line
          }).on('end', () => {
            lines.push(result)
            resolve()
          })
        }))
      })
      // https://github.com/mochajs/mocha/issues/1128
      // https://github.com/mochajs/mocha/issues/2407
      Promise.all(tests).then(_ => {
        expect(lines).to.deep.equal(lineDst)
        done()
      }).catch(done)
    })

    it('2. Buffer test', function (done) {
      const lineSrc = '123'
      const lineDst = '123456789000'
      let result = ''

      str.prototype._read = function () {
        if (!this.ended) {
          var self = this
          process.nextTick(function () {
            self.push(self._str)
          })
          setTimeout(() => self.push('456'), 5)
          setTimeout(() => self.push('789'), 10)
          setTimeout(() => self.push('000'), 100)
          setTimeout(() => self.push(null), 200)
          this.ended = true
        }
      }

      str(lineSrc).pipe(new LineBuffer()).on('data', line => {
        result += line
      }).on('end', () => {
        expect(result).to.equal(lineDst)
        done()
      })
    })

    it('3. Buffer test with prompt', function (done) {
      const lineSrc = '123'
      const lineDst = '123'
      let result = ''
      const lineBuffer = new LineBuffer()

      str.prototype._read = function () {
        if (!this.ended) {
          var self = this
          process.nextTick(function () {
            self.push(self._str)
          })
          setTimeout(() => self.push(null), 1)
          this.ended = true
        }
      }

      lineBuffer.expectPrompt()
      str(lineSrc).pipe(lineBuffer).on('data', line => {
        result += line
      }).on('end', () => {
        /* no need to check the delay time as pushing message after push(null) will throw an error */
        expect(result).to.equal(lineDst)
        done()
      })
    })
  })

  describe('KeywordFilter should find all occurrences of keywords of a line', () => {
    it('1. Basic test', function (done) {
      const lineSrc = 'hello world\r\nhello kitty\r\nhello doggy'
      const kw = 'world'
      const lineDst = 'hello world\r\n'
      const filter = new KeywordFilter()

      str(lineSrc).pipe(new LineParser(true, true)).pipe(filter)

      filter.keywordInstall(kw)
      filter.listen().then(data => {
        filter.keywordUninstall()
        expect(data).to.equal(lineDst)
        done()
      }).catch(done)
    })

    it('2. Basic test with delayed messages', function (done) {
      const lineSrc = 'hello world\r\nhello kitty\r\nhello doggy'
      const kw = 'doggy'
      const lineDst = 'hello doggy'
      const filter = new KeywordFilter()

      str.prototype._read = function () {
        if (!this.ended) {
          var self = this
          process.nextTick(function () {
            self.push(self._str)
          })
          setTimeout(() => self.push(null), 200)
          this.ended = true
        }
      }

      str(lineSrc).pipe(new LineParser(true, true)).pipe(filter)

      filter.keywordInstall(kw)
      filter.listen().then(data => {
        expect(data).to.equal(lineDst)
        done()
      }).catch(done)
    })
  })

  describe('TimestampPrefix should add correct timestamp to the start of the line', () => {
    function ansi2regex (regexString) {
      return regexString.split('').reduce((sum, cur) => {
        sum.push(sprintf('\\u%04x', cur.charCodeAt(0)))
        return sum
      }, []).join('')
    }
    it('1. Basic test', function (done) {
      const lineSrc = '\r\nhello world'
      let timestamp = ansi2regex(ansi.bold.open + ansi.grey.open) +
                      '\\d+:\\d+:\\d+\\.\\d+: ' +
                      ansi2regex(ansi.grey.close + ansi.bold.close)
      const lineDst = '\r\n' + timestamp + 'hello world'
      const prefix = new TimestampPrefix()
      let result = ''

      str(lineSrc).pipe(new LineParser(true, true)).pipe(prefix).on('data', data => {
        result += data
      }).on('end', () => {
        expect(result).to.match(new RegExp(lineDst))
        done()
      })
    })

    it('2. Delayed message', function (done) {
      const lineSrc = '\r\n'
      let timestamp = ansi2regex(ansi.bold.open + ansi.grey.open) +
                      '\\d+:\\d+:\\d+\\.\\d+: ' +
                      ansi2regex(ansi.grey.close + ansi.bold.close)
      const lineDst = '\r\n' + timestamp + 'hello world'
      const prefix = new TimestampPrefix()
      const delay = 200
      let result = ''
      let time1
      let time2

      str.prototype._read = function () {
        if (!this.ended) {
          var self = this
          process.nextTick(function () {
            self.push(self._str)
          })
          setTimeout(() => {
            self.push('hello world')
            self.push(null)
          }, delay)
          this.ended = true
        }
      }

      str(lineSrc).pipe(new LineParser(true, true)).pipe(prefix).on('data', data => {
        if (data === '\r\n') {
          time1 = Date.now()
        } else {
          time2 = Date.now()
        }
        result += data
      }).on('end', () => {
        expect(result).to.match(new RegExp(lineDst))
        expect(time2 - time1).to.be.above(delay)
        done()
      })
    })
  })
})
