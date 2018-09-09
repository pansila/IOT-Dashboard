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
  // return through2.obj(write, done => done())
  return through2.obj(function (line, _, next) {
    let d = new Date()
    let timestamp = d.toTimeString().slice(0, 8) + '.' + PadMilliseconds(d.getMilliseconds()) + ': '
    timestamp = ansi.bold.open + ansi.grey.open + timestamp + ansi.grey.close + ansi.bold.close + line
    // console.log(timestamp)
    this.push(timestamp)
    next()
  }, done => done())
}

function ImplicitCarriage () {
  return through2.obj(function (line, _, next) {
    line = line.replace(/[\r\n]+$/, '')
    this.push('\r\n' + line)
    next()
  }, done => done())
}

export {TimestampPrefix, ImplicitCarriage}
