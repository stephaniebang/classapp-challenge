const assert = require('assert')
const fns = require('../index')

describe('getAddresses()', () => {
  it('should return an array with 1 object', () => {
    const colName = 'email Responsável, Pai'
    const col = 'johndoepai1@gmail.com :)'
    const correct = [{
      "type": "email",
      "tags": [
        "Responsável",
        "Pai"
      ],
      "address": "johndoepai1@gmail.com"
    }]

    // fns.getAddress('johndoepai2@gmail.com/johndoepai3@gmail.com', 'email Mãe')

    assert.deepEqual(correct, fns.getAddresses(col, colName))
  })
})

describe('getAddresses()', () => {
  it('should return an array with 2 objects', () => {
    const colName = 'email Responsável, Pai'
    const col = 'johndoepai2@gmail.com/johndoepai3@gmail.com'
    const correct = [
      {
        "type": "email",
        "tags": [
          "Responsável",
          "Pai"
        ],
        "address": "johndoepai2@gmail.com"
      },
      {
        "type": "email",
        "tags": [
          "Responsável",
          "Pai"
        ],
        "address": "johndoepai3@gmail.com"
      }
    ]

    assert.deepEqual(correct, fns.getAddresses(col, colName))
  })
})
