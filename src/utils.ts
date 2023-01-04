
function getInnerHeight( elm: HTMLElement ): number {
  var computed = getComputedStyle(elm),
      padding = parseInt(computed.paddingTop) + parseInt(computed.paddingBottom);

  return elm.clientHeight - padding
}

function getInnerWidth( elm: HTMLElement ): number {
  var computed = getComputedStyle(elm),
      padding = parseInt(computed.paddingLeft) + parseInt(computed.paddingRight);

  return elm.clientWidth - padding
}

function createRandomString (length: number): string {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default {
  getInnerHeight, 
  getInnerWidth,
  createRandomString
}

