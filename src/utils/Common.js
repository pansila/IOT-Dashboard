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

class LineParser extends Stream.Transform {
  newlineReg = new RegExp(/\r\n|\n\r/g)
  implicitCarriage
  implicitLineFeed
  position

  constructor (implicitCarriage, implicitLineFeed) {
    super({
      readableObjectMode: true,
      writableObjectMode: true
    })
    this.implicitCarriage = implicitCarriage
    this.implicitLineFeed = implicitLineFeed

    if (this.implicitCarriage) this.implicitCarriageReg = new RegExp(/\r\n|\n/g)
    if (this.implicitLineFeed) this.implicitLineFeedReg = new RegExp(/\r\n|\r/g)
  }

  _transform (line, enc, next) {
    line = line.toString()

    line = line.replace(this.newlineReg, '\r\n')
    if (this.implicitCarriage) line = line.replace(this.implicitCarriageReg, '\r\n')
    if (this.implicitLineFeed) line = line.replace(this.implicitLineFeedReg, '\r\n')

    let data = line
    while ((this.position = data.indexOf('\r\n')) !== -1) {
      this.push(data.slice(0, this.position + 2))
      data = data.slice(this.position + 2)
    }
    if (data !== '') this.push(data)
    next()
  }
}

/* join the split words resulting of serial port output delay to form a line */
class LineBuffer extends Stream.Transform {
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
    line = line.toString()
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
         * it makes LineBuffer dependent on the output structure of TimestampPrefix
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
    line = line.toString()

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

export {LineParser, LineBuffer, TimestampPrefix, KeywordFilter}
