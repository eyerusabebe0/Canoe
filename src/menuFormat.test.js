import test from 'node:test'
import assert from 'node:assert/strict'
import { splitDisplayName, normalizeCategoryName, parseMenuItemName } from './menuFormat.js'

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

test('parseMenuItemName keeps English and Amharic fields separately', () => {
  assert.deepEqual(parseMenuItemName('እንቁላል ሳንዱች / Egg Sandwich'), {
    amharicName: 'እንቁላል ሳንዱች',
    name: 'Egg Sandwich',
  })

  assert.deepEqual(parseMenuItemName('Soup'), {
    amharicName: '',
    name: 'Soup',
  })
})

test('normalizeCategoryName preserves bilingual category labels for display', () => {
  assert.equal(normalizeCategoryName('ቁርስ / Breakfast'), 'ቁርስ / Breakfast')
  assert.equal(normalizeCategoryName('የጾም ምግቦች / Fasting Foods'), 'የጾም ምግቦች / Fasting Foods')
  assert.equal(normalizeCategoryName('Burger'), 'Burger')
})

test('normalizeCategoryName corrects the legacy non-fasting Amharic label', () => {
  assert.equal(normalizeCategoryName('የጾም ያልሆኑ ምግቦች'), 'የፍስክ ምግቦች / Non-Fasting Foods')
  assert.equal(normalizeCategoryName('የጾም ያልሆኑ ምግቦች / Non-Fasting Foods'), 'የፍስክ ምግቦች / Non-Fasting Foods')
})

test('normalizeCategoryName corrects the legacy Snack translation', () => {
  assert.equal(normalizeCategoryName('መክሰስ'), 'ስናክ / Snack')
  assert.equal(normalizeCategoryName('መክሰስ / Snack'), 'ስናክ / Snack')
})
