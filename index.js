const fs = require('fs')
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
const emailRegex = /^([a-z0-9_\.\+-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/

const getDataFromCSV = (fileName, callback) => {
  return fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) return console.log(err)

    return callback(data)
  })
}

const printData = data => {
  const rows = data.split('\n')

  const colNames = getColumnsNames(rows.shift())
  console.log(colNames)

  const eidIndex = colNames.indexOf('eid')

  const result = []
  
  rows.map(row => {
    const cols = row.split(',')
    const repeatedIndex = result.findIndex(obj => obj.eid === cols[eidIndex])

    if (repeatedIndex >= 0) return console.log(row)

    result.push(getRowData(row))
  })
}

const getColumnsNames = row => row.split(/(?!, ),/)

const getRowData = (row, colNames) => row.map((col, ind) => {
  if (isAddress(colNames[ind])) return
})

const isAddress = colName => colName.contains(' ')

const getAddresses = (col, colName) => {
  const names = colName.split(/, | /)
  const type = names.shift()
  const tags = names
  const addresses = getEmails(col)

  return addresses.map(address => ({ type, tags, address }))
}

const getEmails = str => {
  const emails = getMultipleValues(str)

  return emails.filter(email => isValidEmail(email))
}

const getMultipleValues = str => str.split(/ |\//).filter(val => val)

const isValidEmail = email => emailRegex.test(email.toLowerCase())

// getDataFromCSV('input.csv', printData)

module.exports = {
  getAddresses
}
