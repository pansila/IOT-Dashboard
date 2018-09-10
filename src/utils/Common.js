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

function TimestampPrefix () {
  return through2.obj(function (line, _, next) {
    let position = line.indexOf('\r\n')
    // console.log(position, line)
    if (position !== -1) {
      let d = new Date()
      let timestamp = d.toTimeString().slice(0, 8) + '.' + PadMilliseconds(d.getMilliseconds()) + ': '
      timestamp = ansi.bold.open + ansi.grey.open + timestamp + ansi.grey.close + ansi.bold.close
      this.push(line.slice(0, position + 2) + timestamp + line.slice(position + 2))
    } else {
      this.push(line)
    }
    next()
  }, done => done())
}

function LineParser (implicitCarriage, implicitLineFeed) {
  return through2.obj(function (line, _, next) {
    let position
    line = line.toString()

    // console.log('lineparser before', Buffer.from(line))
    // line = line.replace(/(?<!\r)\n\r(?!\n)/g, '\r\n')
    line = line.replace(/([^\r])\n\r(?!\n)/g, '$1\r\n')
    // console.log('lineparser 0', Buffer.from(line))
    if (implicitCarriage) line = line.replace(/((\r\n|\n\r)+|[^\r])\n(?!\r)/g, '$1\r\n')
    // console.log('lineparser 1', Buffer.from(line))
    if (implicitLineFeed) line = line.replace(/((\r\n|\n\r)+|[^\n])\r(?!\n)/g, '$1\r\n')
    // console.log('lineparser 2', Buffer.from(line))
    // console.log('lineparser after', Buffer.from(line))

    let data = line
    while ((position = data.indexOf('\r\n')) !== -1) {
      // console.log(Buffer.from(data.slice(0, position + 2)))
      this.push(data.slice(0, position + 2))
      data = data.slice(position + 2)
    }
    // console.log(Buffer.from(data))
    this.push(data)
    next()
  }, done => done())
}

function LineBreaker () {
  return through2.obj(function (line, _, next) {
    line = line.replace(/[\r\n]+$/, '')
    this.push('\r\n' + line)
    next()
  }, done => done())
}

export {TimestampPrefix, LineBreaker, LineParser}
