/**
 * Converts an English string into corresponding Unicode characters.
 * @param {string} input - The input string in English characters.
 * @returns {string} - The converted string with Unicode characters.
 */
function coelbrenify(input) {
  const unicodeMap = {
    a: '\uE001',
    b: '\uE00D',
    c: '\uE016',
    d: '\uE01F',
    e: '\uE033',
    f: '\uE015',
    g: '\uE02F',
    h: '\uE027',
    i: '\uE005',
    j: '\uE003',
    k: '\uE017',
    l: '\uE022',
    m: '\uE038',
    n: '\uE021',
    o: '\uE009',
    p: '\uE012',
    q: '\uE030',
    r: '\uE026',
    s: '\uE03B',
    t: '\uE01B',
    u: '\uE03D',
    v: '\uE00B',
    w: '\uE03F',
    x: '\uE031',
    y: '\uE040',
    z: '\uE03B'
  }

  return input
    .toLowerCase()
    .split('')
    .map(char => unicodeMap[char] || char) // Convert or keep original if no mapping exists
    .join('')
}

export default coelbrenify
