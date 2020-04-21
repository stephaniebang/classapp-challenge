const fs = require('fs')
const assert = require('assert')
const { csvToJson } = require('../index')

const sort = obj => {
  const classes = obj.classes.sort()
  const addresses = obj.addresses.sort((a, b) => {
    if (a.address < b.address) return 1
    if (a.address > b.address) return -1
    return 0
  }).map(a => a.tags = a.tags.sort())

  return { ...obj, classes, addresses }
}

describe('csvToJson()', () => {
  it('should match the challenge\'s output example', () => {
    csvToJson('input.csv')

    const correct = JSON.parse(fs.readFileSync('./test/output_example.json', 'utf8'))
    const result = JSON.parse(fs.readFileSync('./output.json', 'utf8'))

    assert.deepEqual(correct, result)
  })

  it('should join repeated entries with repeated tags correctly', () => {
    csvToJson('./test/input_repeated.csv')

    const correct = JSON.parse(fs.readFileSync('./test/output_repeated.json', 'utf8'))
    const result = JSON.parse(fs.readFileSync('./output.json', 'utf8'))

    assert.deepEqual(correct, result)
  })

  it('should return the same content despite column order', () => {
    csvToJson('./test/input_order.csv')

    const correct = JSON.parse(fs.readFileSync('./test/output_example.json', 'utf8'))
    const result = JSON.parse(fs.readFileSync('./output.json', 'utf8'))

    assert.deepEqual(sort(correct[0]), sort(result[0]))
  })

  it('should return addresses with correct tags', () => {
    csvToJson('./test/input_tags.csv')

    const correct = JSON.parse(fs.readFileSync('./test/output_tags.json', 'utf8'))
    const result = JSON.parse(fs.readFileSync('./output.json', 'utf8'))

    assert.deepEqual(correct, result)
  })
})
