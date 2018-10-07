// import {LineParser, LineBuffer, TimestampPrefix, KeywordFilter} from '@utils/Common.js'
import {LineParser, LineBuffer} from '@utils/Common.js'
import str from 'string-to-stream'

describe('Test utilities in Common.js', () => {
  describe('LineParser should replace line marks correctly', () => {
    it('1. line starts and ends with \\r', function (done) {
      const lineSrc = '\r\r\r\n\n1\r2\n3\n\r4\r'
      const lineDst = '\r\n\r\n\r\n\r\n1\r\n2\r\n3\r\n4\r\n'
      let result = ''

      str(lineSrc).pipe(new LineParser()).on('data', data => {
        result += data
      }).on('end', () => {
        expect(result).to.deep.equal(lineDst)
        done()
      })
    })

    it('2. line starts and ends with \\n', function (done) {
      const lineSrc = '\n\n\n\r1\n\n2\n\n'
      const lineDst = '\r\n\r\n\r\n1\r\n\r\n2\r\n\r\n'
      let result = ''

      str(lineSrc).pipe(new LineParser()).on('data', data => {
        result += data
      }).on('end', () => {
        expect(result).to.deep.equal(lineDst)
        done()
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
      const lineDst = '123456789'
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
        expect(result).to.deep.equal(lineDst)
        done()
      })
    })
  })
})
