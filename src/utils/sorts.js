

export const mapOrder = (originalArray, orderArray, key) => {
  if (!originalArray || !orderArray || !key) return []

  const clonedArray = [...originalArray]
  const orderedArray = clonedArray.sort((a, b) => {
    return orderArray.indexOf(a[key]) - orderArray.indexOf(b[key])
  })

  return orderedArray
}
/*
  const data = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' }
  ]
    const columnorderIds = ['1', '3', '2']
  const sortedData = mapOrder(data, order, 'id')
  console.log(sortedData)
  [
    { id: '1', name: 'Item 1' },
    { id: '3', name: 'Item 3' },
    { id: '2', name: 'Item 2' }
  ]
*/