export default {
  unicodeFormat (val) {
    return '&#x' + val.toString(16) + ';'
  }
}
