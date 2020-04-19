const fs = require('fs')
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
const emailRegex = /^([a-z0-9_\.\+-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/

const CSVtoJSON = fileName => {
  const data = fs.readFileSync(fileName, 'utf8')
  const rows = data.split('\n')
  const colNames = splitRowInColumns(rows.shift())
  const eidIndex = colNames.indexOf('eid')
  const result = []
  
  rows.map(row => {
    const cols = splitRowInColumns(row)
    const repeatedIndex = result.findIndex(obj => obj.eid === cols[eidIndex])

    // if (repeatedIndex >= 0) return console.log(row)

    result.push(getRowData(cols, colNames))
  })

  return result
}

const splitRowInColumns = row => row.split(/(?!, ),/).map(str => trimString(str))

const getRowData = (row, colNames) => {
  const result = {}

  row.map((col, ind) => {
    if (isAddress(colNames[ind])) return result.addresses
      ? result.addresses = result.addresses.concat(getAddresses(col, colNames[ind]))
      : result.addresses = getAddresses(col, colNames[ind])

    if (isClass(colNames[ind])) return result.classes
      ? result.classes = result.classes.concat(getClasses(col))
      : result.classes = getClasses(col)

    if (hasBooleanValue(colNames[ind]) && !result[colNames[ind]])
      return result[colNames[ind]] = !!col

    return result[colNames[ind]] = col
  })

  return result
}

const isAddress = name => name.includes(' ')
const isClass = name => name === 'class'
const hasBooleanValue = name => name === 'invisible' || name === 'see_all'

const getAddresses = (col, colName) => {
  const names = colName.split(/, | /)
  const type = names.shift()
  const tags = names
  const addresses = type === 'email' ? getEmails(col) : getPhone(col)

  return addresses.map(address => ({ type, tags, address }))
}

const getEmails = str => {
  const possibleEmails = getMultipleValues(str)

  return possibleEmails.filter(email => isValidEmail(email))
}

const getPhone = str => {
  const phoneArray = []
  
  try {
    const number = phoneUtil.parseAndKeepRawInput(str, 'BR')

    if (phoneUtil.isPossibleNumber(number))
      phoneArray.push(`${number.getCountryCode()}${number.getNationalNumber()}`)
  }
  catch { }

  return phoneArray
}

const getMultipleValues = str => str.split(/ |\//).filter(val => trimString(val))

const isValidEmail = email => emailRegex.test(email.toLowerCase())

const getClasses = str => str.split(/\/|,/).map(s => trimString(s))

const trimString = str => str.trim().replace(/^"+|"+$/, '')

CSVtoJSON('input.csv')

module.exports = {
  getAddresses,
  CSVtoJSON
}
