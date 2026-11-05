const fs = require('node:fs');
module.exports = function barcodeVideo(path, prefix) {
  const digits = prefix.split('').map(Number);
  if (digits.length !== 12) throw new Error('EAN fixture requires 12 digits');
  const code =
    prefix +
    ((10 -
      (digits.reduce((sum, value, i) => sum + value * (i % 2 ? 3 : 1), 0) %
        10)) %
      10);
  const left = [
    '0001101',
    '0011001',
    '0010011',
    '0111101',
    '0100011',
    '0110001',
    '0101111',
    '0111011',
    '0110111',
    '0001011',
  ];
  const parity = [
    'LLLLLL',
    'LLGLGG',
    'LLGGLG',
    'LLGGGL',
    'LGLLGG',
    'LGGLLG',
    'LGGGLL',
    'LGLGLG',
    'LGLGGL',
    'LGGLGL',
  ][Number(code[0])];
  const invert = (bits) =>
    bits.replace(/[01]/g, (bit) => (bit === '0' ? '1' : '0'));
  let bits = '101';
  for (let i = 1; i <= 6; i++)
    bits +=
      parity[i - 1] === 'L'
        ? left[Number(code[i])]
        : invert(left[Number(code[i])]).split('').reverse().join('');
  bits += '01010';
  for (let i = 7; i <= 12; i++) bits += invert(left[Number(code[i])]);
  bits += '101';
  const width = 640,
    height = 480,
    frame = Buffer.alloc((width * height * 3) / 2, 128);
  frame.fill(235, 0, width * height);
  const xStart = Math.floor((width - bits.length * 4) / 2);
  for (let y = 140; y < 340; y++)
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === '1')
        frame.fill(
          16,
          y * width + xStart + i * 4,
          y * width + xStart + i * 4 + 4,
        );
    }
  fs.writeFileSync(
    path,
    Buffer.concat([
      Buffer.from('YUV4MPEG2 W640 H480 F5:1 Ip A1:1 C420jpeg\nFRAME\n'),
      frame,
    ]),
  );
  return code;
};
