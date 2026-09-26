import test from 'node:test'
import assert from 'node:assert/strict'
import { splitDisplayName, normalizeCategoryName } from './menuFormat.js'

test('splitDisplayName separates Amharic and English names', () => {
  assert.deepEqual(splitDisplayName('እንቁላል ሳንዱች / Egg Sandwich'), {
    amharicName: 'እንቁላል ሳንዱች',
    name: 'Egg Sandwich',
  })

  assert.deepEqual(splitDisplayName('ቁርስ / Breakfast'), {
    amharicName: 'ቁርስ',
    name: 'Breakfast',
  })

  assert.deepEqual(splitDisplayName('Breakfast'), {
    amharicName: '',
    name: 'Breakfast',
  })
})

test('normalizeCategoryName keeps a clean English category name', () => {
  assert.equal(normalizeCategoryName('ቁርስ Breakfast'), 'Breakfast')
  assert.equal(normalizeCategoryName('የጾም ምግቦች / Fasting Foods'), 'Fasting Foods')
  assert.equal(normalizeCategoryName('Burger'), 'Burger')
})
