const fs = require('fs')
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

const ID_COL = 'eid'
const ROW_SPLIT_REGEX = /(?!, ),/
const ADDRESS_COL_SPLIT_REGEX = /, | /
const VALUE_SPLIT_REGEX = /\/|, /
const EMAIL_REGEX = /^([a-z0-9_\.\+-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/

const csvToJson = fileName => {
  const rows = readCsvToArray(fileName)
  const data = getStudentsFromArray(rows)

  fs.writeFileSync('output.json', JSON.stringify(data, null, 2), err => {
    if (err) throw err
  })
}

const readCsvToArray = fileName => fs.readFileSync(fileName, 'utf8').split('\n')

const getStudentsFromArray = rows => {
  const colNames = splitString(rows.shift(), ROW_SPLIT_REGEX)
  const students = []

  rows.map(row => {
    const cols = splitString(row, ROW_SPLIT_REGEX, true)
    const student = getStudentData(cols, colNames)
    const dupStudentIndex = students.findIndex(s => s[ID_COL] === student[ID_COL])

    if (dupStudentIndex < 0) return students.push(student)

    const dupStudent = students[dupStudentIndex]
    
    Object.keys(dupStudent).map(key => {
      if (key === 'classes')
        return dupStudent.classes = insertClass(dupStudent.classes, student.classes)
      if (key === 'addresses')
        return dupStudent.addresses = insertAddress(dupStudent.addresses, student.addresses)
      if (typeof dupStudent[key] === 'boolean')
        return dupStudent[key] = dupStudent[key] || student[key]
    })
  })

  return students
}

const splitString = (str, pattern, noFilter = false) => str
  .split(pattern)
  .filter(s => noFilter || s)
  .map(s => s.trim().replace(/^"+|"+$/, ''))

const getStudentData = (row, colNames) => {
  const data = {}

  row.map((col, ind) => {
    if (isAddressColumn(colNames[ind]))
      return data.addresses = insertAddress(data.addresses, getAddresses(col, colNames[ind]))

    if (isClassColumn(colNames[ind]))
      return data.classes = insertClass(data.classes, splitString(col, VALUE_SPLIT_REGEX))

    if (hasBooleanValue(colNames[ind])) return data[colNames[ind]] = getBooleanValue(col)

    return data[colNames[ind]] = col
  })

  return data
}

const isAddressColumn = name => name.includes(' ')

const getAddresses = (col, colName) => {
  const tags = splitString(colName, ADDRESS_COL_SPLIT_REGEX, true)
  const type = tags.shift()
  const addresses = type === 'email' ? getEmails(col) : getPhone(col)

  return addresses.map(address => ({ type, tags, address }))
}

const getEmails = str =>
  splitString(str, VALUE_SPLIT_REGEX).filter(email => isValidEmail(email))

const isValidEmail = email => EMAIL_REGEX.test(email.toLowerCase())

const getPhone = str => {
  const phoneArray = []
  
  try {
    const number = phoneUtil.parseAndKeepRawInput(str, 'BR')

    if (phoneUtil.isValidNumber(number))
      phoneArray.push(`${number.getCountryCode()}${number.getNationalNumber()}`)
  } catch { }

  return phoneArray
}

const insertAddress = (addresses, entries) => {
  if (!addresses) return entries

  entries.map(e => {
    const repeatedIndex = addresses.findIndex(a => a.address === e.address)

    if (repeatedIndex < 0) return addresses.push(e)

    addresses[repeatedIndex].tags = concat(addresses[repeatedIndex].tags, e.tags)
  })

  return addresses
}

const concat = (arr1, arr2) => arr1.concat(arr2).filter((el, ind, self) =>
  ind === self.indexOf(el)
)

const isClassColumn = name => name === 'class'

const insertClass = (classes, entries) => {
  if (!classes) return entries

  if (entries.length && typeof classes === 'string') classes = [classes]
  if (typeof entries === 'string') entries = [entries]

  entries.map(e => {
    if (classes.findIndex(c => c === e) < 0) classes.push(e)
  })

  return classes.length === 1 ? classes[0] : classes
}

const hasBooleanValue = name => name === 'invisible' || name === 'see_all'

const getBooleanValue = str => {
  if (str === 'yes') return true
  if (str === 'no') return false
  return !!parseInt(str)
}

// function call
csvToJson(process.argv[2] || 'input.csv')

// export for testing
module.exports = { csvToJson }
