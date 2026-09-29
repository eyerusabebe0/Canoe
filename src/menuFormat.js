const ETHIOPIC_RANGES = /[\u1200-\u137F\u1380-\u139F\u2D80-\u2DDF]/

export function splitDisplayName(rawValue = '') {
  const value = String(rawValue ?? '').trim()

  if (!value) {
    return { amharicName: '', name: '' }
  }

  if (value.includes(' / ')) {
    const [amharicPart, englishPart] = value.split(' / ')
    return {
      amharicName: amharicPart?.trim() || '',
      name: englishPart?.trim() || '',
    }
  }

  const hasEthiopic = ETHIOPIC_RANGES.test(value)
  const hasLatin = /[A-Za-z]/.test(value)

  if (!hasEthiopic || !hasLatin) {
    return { amharicName: '', name: value }
  }

  const latinIndex = value.search(/[A-Za-z]/)
  if (latinIndex <= 0) {
    return { amharicName: '', name: value }
  }

  return {
    amharicName: value.slice(0, latinIndex).trim(),
    name: value.slice(latinIndex).trim(),
  }
}

export function parseMenuItemName(rawValue = '') {
  const parsed = splitDisplayName(rawValue)
  return {
    amharicName: String(parsed.amharicName || '').trim(),
    name: String(parsed.name || '').trim(),
  }
}

// Keep the original bilingual category label so the menu and admin dropdowns
// can display both scripts. The English half is still available for matching
// when needed through a separate key helper.
export function normalizeCategoryName(rawValue = '') {
  const value = String(rawValue ?? '').trim()
  if (!value) return ''

  const normalized = value.replace(/\s+/g, ' ')
  const legacyNonFastingNames = [
    'የጾም ያልሆኑ ምግቦች',
    'የጾም ያልሆኑ ምግቦች / Non-Fasting Foods',
  ]
  const legacySnackNames = ['መክሰስ', 'መክሰስ / Snack']

  if (legacySnackNames.includes(normalized)) return 'ስናክ / Snack'
  return legacyNonFastingNames.includes(normalized)
    ? 'የፍስክ ምግቦች / Non-Fasting Foods'
    : normalized
}

export function getCategoryKey(rawValue = '') {
  const value = normalizeCategoryName(rawValue)
  if (!value) return ''

  if (value.includes(' / ')) {
    const parts = value.split(' / ').map((part) => part.trim()).filter(Boolean)
    return (parts.at(-1) || value).replace(/\s+/g, ' ')
  }

  return value
}