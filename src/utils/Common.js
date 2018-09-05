import through2 from 'through2'

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
    let d = new Date()
    this.push(d.toTimeString().slice(0, 8) + '.' + PadMilliseconds(d.getMilliseconds()) + ': ' + line)
    next()
  }, done => done())
}

export {TimestampPrefix}
