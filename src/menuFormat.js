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

// Categories are bilingual, same as dish names: "አማርኛ / English".
// We only trim and collapse whitespace here — we no longer strip the
// Amharic half out, so "በርገር / Burger" stays "በርገር / Burger" everywhere
// (menu tabs, admin pills, the dish table, etc).
export function normalizeCategoryName(rawValue = '') {
  const value = String(rawValue ?? '').trim()
  if (!value) return ''

  if (value.includes(' / ')) {
    const parts = value.split(' / ').map((part) => part.trim()).filter(Boolean)
    return parts.join(' / ').replace(/\s+/g, ' ')
  }

  return value.replace(/\s+/g, ' ')
}