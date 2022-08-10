const DEFAULT_NUMBER_FORMAT = {}

// default black, non-bold
const PLAIN_TEXT = {
  bold: false,
  foregroundColor: {
    red: 0,
    green: 0,
    blue: 0
  }
}

const BACKGROUND_WHITE = {
  red: 1,
  green: 1,
  blue: 1
}

// returns a function that can setup the formatter based on the result of an `append` call
export const setupFormatColumns = (resp, pageId) => {
  let range = resp.data.updates.updatedRange
  let rowStart = range.match(/(?<row>\d+):/).groups.row - 1 // index of the first newly written row
  let length = resp.data.updates.updatedRows

  return (colIndex, numberFormat=DEFAULT_NUMBER_FORMAT, textFormat=PLAIN_TEXT, backgroundColor=BACKGROUND_WHITE) => {

    // handle single column and range [cstart, cend)
    var cstart = colIndex, cend = colIndex + 1;
    if (typeof(colIndex) == 'object') {
      cstart = colIndex[0];
      cend = colIndex[1];
    }

    return {
      repeatCell: {
        range: {
          sheetId: pageId,
          startRowIndex: rowStart,
          endRowIndex: rowStart + length,
          startColumnIndex: cstart,
          endColumnIndex: cend
        },
        cell: {
          userEnteredFormat: {
            numberFormat: numberFormat,
            textFormat: textFormat,
            backgroundColor: backgroundColor,
          }
        },
        fields: `userEnteredFormat(backgroundColor,numberFormat,textFormat)`
      }
    }
  }
}