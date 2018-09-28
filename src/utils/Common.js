import through2 from 'through2'
import ansi from 'ansi-styles'
import { Stream } from 'stream'

function PadMilliseconds (v) {
  if (v < 10) {
    return '00' + v
  }
  if (v < 100) {
    return '0' + v
  }
  return v
}

class TimestampPrefix extends Stream.Transform {
  newline = false

  constructor (options) {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    })
  }

  _transform (line, enc, next) {
    if (this.newline) {
      let d = new Date()
      let timestamp = d.toTimeString().slice(0, 8) + '.' + PadMilliseconds(d.getMilliseconds()) + ': '
      timestamp = ansi.bold.open + ansi.grey.open + timestamp + ansi.grey.close + ansi.bold.close
      this.push(timestamp)
    }
    this.push(line)
    this.newline = line.endsWith('\r\n')
    next()
  }
}

function LineBreaker (implicitCarriage, implicitLineFeed) {
  return through2.obj(function (line, _, next) {
    let position
    line = line.toString()

    // console.log('lineparser before', line)
    // console.log('lineparser before', Buffer.from(line))
    // line = line.replace(/(?<!\r)\n\r(?!\n)/g, '\r\n')
    line = line.replace(/((\r\n|\n\r)*?|.|^)\n\r/g, '$1\r\n')
    // console.log('lineparser 0', Buffer.from(line))
    if (implicitCarriage) line = line.replace(/((\r\n)+|[^\r]|^)\n($|[^\r]|(\r\n)+)/g, '$1\r\n$3')
    // console.log('lineparser 1', Buffer.from(line))
    if (implicitLineFeed) line = line.replace(/((\r\n)+|[^\n]|^)\r(?!\n)/g, '$1\r\n')
    // console.log('lineparser 2', Buffer.from(line))
    // console.log('lineparser after', Buffer.from(line))

    let data = line
    while ((position = data.indexOf('\r\n')) !== -1) {
      // console.log(Buffer.from(data.slice(0, position + 2)))
      this.push(data.slice(0, position + 2))
      data = data.slice(position + 2)
    }
    // console.log(Buffer.from(data))
    if (data !== '') this.push(data)
    next()
  }, done => done())
}

/* join the split words resulting of serial port output delay to form a line */
class LineParser extends Stream.Transform {
  buffer = ''
  timerID = undefined
  prompt = false

  constructor (options) {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    })
  }

  _transform (line, enc, next) {
    if (line.endsWith('\r\n')) {
      this.push(this.buffer + line)
      if (this.timerID) {
        clearTimeout(this.timerID)
        this.timerID = null
      }
      this.buffer = ''
    } else {
      if (this.buffer === '') {
        /* workaround to flush prompt characters immediately to avoid prompt lag,
         * it makes LineParser dependent on the output structure of TimestampPrefix
         * TODO: a better way to decouple
         */
        if (line.startsWith('\x1b\x5b')) {
          this.push(line)
          next()
          return
        }
        if (this.prompt && line.length < 5) {
          this.push(line)
        } else {
          this.timerID = setTimeout(() => {
            if (this.buffer !== '') {
              this.push(this.buffer)
              this.buffer = ''
              this.timerID = null
            }
          }, 10)
          this.buffer = line
        }
        this.prompt = false
      } else {
        this.buffer += line
      }
    }
    next()
  }

  expectPrompt () {
    this.prompt = true
  }
}

class KeywordFilter extends Stream.Transform {
  buffer = ''
  keywords = []
  futureResolve = undefined
  timerID = undefined

  constructor (options) {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    })
  }

  findKeyword (line) {
    let keywords = this.keywords
    keywords.forEach(kw => {
      if (kw.test(line)) {
        this.futureResolve(line)
        this.keywords = []
      }
    })
  }

  _transform (line, enc, next) {
    if (line.endsWith('\r\n')) {
      this.findKeyword(this.buffer + line)
      if (this.timerID) {
        clearTimeout(this.timerID)
        this.timerID = null
      }
      this.buffer = ''
    } else {
      if (this.buffer === '') {
        this.timerID = setTimeout(() => {
          if (this.buffer !== '') {
            this.findKeyword(this.buffer)
            this.buffer = ''
            this.timerID = null
          }
        }, 100)
      }
      this.buffer += line
    }
    this.push(line)
    next()
  }

  listen () {
    return new Promise((resolve, reject) => {
      this.futureResolve = resolve
    })
  }

  keywordInstall (...keywords) {
    keywords.forEach((kw) => {
      this.keywords.push(new RegExp(kw))
    })
  }

  keywordUninstall () {
    this.keywords = []
  }
}

export {LineBreaker, LineParser, TimestampPrefix, KeywordFilter}
