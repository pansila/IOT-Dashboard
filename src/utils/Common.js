import through2 from 'through2'
import ansi from 'ansi-styles'

function PadMilliseconds (v) {
  if (v < 10) {
    return '00' + v
  }
  if (v < 100) {
    return '0' + v
  }
  return v
}

let newline = false
function TimestampPrefix () {
  return through2.obj(function (line, _, next) {
    // console.log(line, newline)
    // console.log(Buffer.from(line))
    if (newline) {
      let d = new Date()
      let timestamp = d.toTimeString().slice(0, 8) + '.' + PadMilliseconds(d.getMilliseconds()) + ': '
      timestamp = ansi.bold.open + ansi.grey.open + timestamp + ansi.grey.close + ansi.bold.close
      this.push(timestamp + line)
    } else {
      this.push(line)
    }
    newline = line.endsWith('\r\n')
    next()
  }, done => done())
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

let buffer = ''
let timerID
/* join the split words resulting of serial port output delay to form a line */
function LineParser () {
  return through2.obj(function (line, _, next) {
    if (line.endsWith('\r\n')) {
      this.push(buffer + line)
      if (timerID) {
        clearTimeout(timerID)
        timerID = null
      }
      buffer = ''
    } else {
      if (buffer === '') {
        /* workaround to flush prompt characters immediately to avoid prompt lag */
        if (line.length < 5 || line.startsWith('\x1b\x5b')) {
          this.push(line)
        } else {
          timerID = setTimeout(() => {
            if (buffer !== '') {
              this.push(buffer)
              buffer = ''
              timerID = null
            }
          }, 10)
          buffer += line
        }
      }
    }
    next()
  }, done => done())
}

class KeywordFilter {
  constructor () {
    this.keywords = []
    let _this = this
    this.piper = through2.obj(function (line, _, next) {
      let keywords = _this.keywords
      keywords.forEach(kw => {
        if (kw.test(line)) {
          _this.listenPromise(line)
          _this.keywords = []
        }
      })
      this.push(line)
      next()
    }, done => done())
  }

  listen () {
    return new Promise((resolve, reject) => {
      this.listenPromise = resolve
    })
  }

  keywordInstall (keyword) {
    let regexp = new RegExp(keyword)
    this.keywords.push(regexp)
  }

  keywordUninstall (keyword) {
    this.keywords = []
  }
}

export {LineBreaker, LineParser, TimestampPrefix, KeywordFilter}
