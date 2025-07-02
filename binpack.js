function getColorPalette() {
    return [
        '#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D', '#C780FA',
        '#FF9671', '#00C9A7', '#FF6F91', '#845EC2', '#0081CF',
        '#F9A825', '#00B8D4', '#B39DDB', '#F48FB1', '#AED581',
        '#7986CB', '#E57373', '#4DB6AC', '#F06292', '#81C784',
        '#BA68C8', '#90CAF9', '#FFF176', '#A1887F', '#CE93D8'
    ];
}

class SkylineBin {
  constructor(width, height, offsetY = 0) {
    this.width = width;
    this.height = height;
    this.offsetY = offsetY;
    this.skyline = [{ x: 0, y: 0, width: width }];
    this.usedRects = [];
  }

  insert(rect) {
    let bestY = Infinity;
    let bestX = -1;
    let bestIndex = -1;

    for (let i = 0; i < this.skyline.length; i++) {
      const node = this.skyline[i];
      if (node.width >= rect.width) {
        const y = this.getMaxY(i, rect.width);
        if (y + rect.height <= this.height && y < bestY) {
          bestY = y;
          bestX = node.x;
          bestIndex = i;
        }
      }
    }

    if (bestIndex === -1) return false;

    rect.x = bestX;
    rect.y = bestY + this.offsetY;
    this.usedRects.push(rect);
    this.addSkylineLevel(bestIndex, { x: bestX, y: bestY + rect.height, width: rect.width });
    return true;
  }

  getMaxY(index, width) {
    let maxY = 0;
    let remaining = width;
    for (let i = index; i < this.skyline.length && remaining > 0; i++) {
      maxY = Math.max(maxY, this.skyline[i].y);
      remaining -= this.skyline[i].width;
    }
    return maxY;
  }

  addSkylineLevel(index, newNode) {
    this.skyline.splice(index, 0, newNode);

    let i = index + 1;
    while (i < this.skyline.length) {
      const curr = this.skyline[i];
      const prev = this.skyline[i - 1];
      if (curr.x < prev.x + prev.width) {
        const overlap = prev.x + prev.width - curr.x;
        if (overlap < curr.width) {
          curr.x += overlap;
          curr.width -= overlap;
          break;
        } else {
          this.skyline.splice(i, 1);
        }
      } else {
        break;
      }
    }

    for (let j = 0; j < this.skyline.length - 1; j++) {
      const a = this.skyline[j];
      const b = this.skyline[j + 1];
      if (a.y === b.y) {
        a.width += b.width;
        this.skyline.splice(j + 1, 1);
        j--;
      }
    }
  }
}

class SkylineBinVertical {
  constructor(width, height, offsetY = 0) {
    this.width = width;
    this.height = height;
    this.offsetY = offsetY; // 이건 x에 더해져야 함
    this.skyline = [{ y: 0, x: 0, height: height }];
    this.usedRects = [];
  }

  insert(rect) {
    let bestX = Infinity;
    let bestY = -1;
    let bestIndex = -1;

    for (let i = 0; i < this.skyline.length; i++) {
      const node = this.skyline[i];
      if (node.height >= rect.height) {
        const x = this.getMaxX(i, rect.height);
        if (x + rect.width <= this.width && x < bestX) {
          bestX = x;
          bestY = node.y;
          bestIndex = i;
        }
      }
    }

    if (bestIndex === -1) return false;

    rect.x = bestX ; // 👈 offsetX는 x에 적용
    rect.y = bestY + this.offsetY;                // 👈 y는 offset 없이 0부터 시작
    this.usedRects.push(rect);

    this.addSkylineLevel(bestIndex, {
      y: bestY,
      x: bestX + rect.width,
      height: rect.height
    });
    return true;
  }

  getMaxX(index, height) {
    let maxX = 0;
    let remaining = height;
    for (let i = index; i < this.skyline.length && remaining > 0; i++) {
      maxX = Math.max(maxX, this.skyline[i].x);
      remaining -= this.skyline[i].height;
    }
    return maxX;
  }

  addSkylineLevel(index, newNode) {
    this.skyline.splice(index, 0, newNode);

    let i = index + 1;
    while (i < this.skyline.length) {
      const curr = this.skyline[i];
      const prev = this.skyline[i - 1];
      if (curr.y < prev.y + prev.height) {
        const overlap = prev.y + prev.height - curr.y;
        if (overlap < curr.height) {
          curr.y += overlap;
          curr.height -= overlap;
          break;
        } else {
          this.skyline.splice(i, 1);
        }
      } else {
        break;
      }
    }

    for (let j = 0; j < this.skyline.length - 1; j++) {
      const a = this.skyline[j];
      const b = this.skyline[j + 1];
      if (a.x === b.x) {
        a.height += b.height;
        this.skyline.splice(j + 1, 1);
        j--;
      }
    }
  }
}


let autoIdCounter = 0;
let nextId = 72;
function getNextId() {
  return String.fromCharCode(nextId + (autoIdCounter++ % 26));
}

function addPartRow() {
    const container = document.getElementById('parts');
    const rowCount = container.children.length;
    const colorPalette = getColorPalette();
    const color = colorPalette[rowCount % colorPalette.length];
    const row = document.createElement('div');
    const id = getNextId();
    row.className = 'part-row';
    row.innerHTML = `
    <input type="text" value="${id}">
    <input type="color" value="${color}" style="margin-left: 6px;">
    <span style="display:inline-block;width:16px;height:16px;background:${color};margin-left:6px;margin-right:6px;"></span>
    <input type="number" placeholder="넓이">
    <input type="number" placeholder="길이">
    <input type="number" placeholder="개수">
  `;
    container.appendChild(row);
}

function optimizeAndDraw() {
  const filmWidth = parseInt(document.getElementById('filmWidth').value);
  const filmHeight = parseInt(document.getElementById('filmHeight').value);
  const scale = 0.2;

  const partRows = document.querySelectorAll('#parts .part-row');
  const parts = [];

  const selectedMode = document.querySelector('input[name="layoutMode"]:checked').value;
  const BinClass = selectedMode === 'vertical' ? SkylineBinVertical : SkylineBin;

  for (const row of partRows) {
    const hInput = row.querySelector('input[placeholder="넓이"]');
    const wInput = row.querySelector('input[placeholder="길이"]');

    const width = parseInt(wInput.value);
    const height = parseInt(hInput.value);

    if (width > filmWidth) {
      alert(`조각의 길이 (${width})가 필름의 가로 (${filmWidth})보다 큽니다.`);
      wInput.focus();
      return;
    }
    if (height > filmHeight) {
      alert(`조각의 넓이 (${height})가 필름의 세로 (${filmHeight})보다 큽니다.`);
      hInput.focus();
      return;
    }
  }

  partRows.forEach(row => {
    const idInput = row.querySelector('input[type="text"]');
    const colorInput = row.querySelector('input[type="color"]');
    const numberInputs = row.querySelectorAll('input[type="number"]');
    const [hInput, wInput, cInput] = numberInputs;
    if (idInput.value && wInput.value && hInput.value && cInput.value) {
      parts.push({
        id: idInput.value,
        width: parseInt(wInput.value),
        height: parseInt(hInput.value),
        count: parseInt(cInput.value),
        color: colorInput ? colorInput.value + '66' : '#cccccc66'
      });
    }
  });

  // 큰 조각부터 정렬
  parts.sort((a, b) => (b.width * b.height) - (a.width * a.height));

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = (selectedMode === 'vertical' ? filmWidth * parts.length : filmWidth) * scale;
  canvas.height = (selectedMode === 'vertical' ? filmHeight : filmHeight * parts.length) * scale;

  let allPlacements = [];
  let bins = [];
  let offsetX = 0;
  let offsetY = 0;
  const margin = 100;

const remainingParts = parts.flatMap(part => {
    return Array.from({ length: part.count }, () => ({ ...part }));
  });

  while (remainingParts.length > 0) {
    const bin = selectedMode === 'vertical'
      ? new BinClass(filmWidth, filmHeight, offsetX)
      : new BinClass(filmWidth, filmHeight, offsetY);

    let binUsed = false;

    for (let i = 0; i < remainingParts.length; ) {
      const part = remainingParts[i];
      const rect = {
        id: part.id,
        width: part.width,
        height: part.height,
        color: part.color
      };

      if (bin.insert(rect)) {
        allPlacements.push(rect);
        remainingParts.splice(i, 1);
        binUsed = true;
      } else {
        i++;
      }
    }

    if (binUsed) {
      bins.push(bin);
      if (selectedMode === 'vertical') {
        offsetX += filmWidth + margin;
      } else {
        offsetY += filmHeight + margin;
      }
    } else {
      console.warn("빈에 아무 조각도 들어가지 못했습니다. 나머지 조각:", remainingParts);
      break;
    }
  }

  if (allPlacements.length === 0) {
    alert("조각이 배치되지 않았습니다. 필름 크기를 늘려보세요.");
    return;
  }

  // const maxX = allPlacements.reduce((max, r) => Math.max(max, r.x + r.width), 0);
  // const maxY = allPlacements.reduce((max, r) => Math.max(max, r.y + r.height), 0);
  // canvas.width = Math.ceil(maxX * scale);
  // canvas.height = Math.ceil(maxY * scale) + 20;
  const binMaxX = bins.reduce((max, b) => {
  const binRight = (b.offsetX || 0) + filmWidth;
  return Math.max(max, binRight);
}, 0);

const binMaxY = bins.reduce((max, b) => {
  const binBottom = (b.offsetY || 0) + filmHeight;
  return Math.max(max, binBottom);
}, 0);

canvas.width = Math.ceil(binMaxX * scale);
canvas.height = Math.ceil(binMaxY * scale);


  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bins.forEach((bin, i) => {
    const binOffset = bin.offsetY;
    const binX = 0;
    const binY = binOffset * scale;

    // 배경
    ctx.fillStyle = i % 2 === 0 ? '#f2f2f2' : '#e6e6e6';
    ctx.fillRect(binX, binY, filmWidth * scale, filmHeight * scale);

    // 테두리
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(binX, binY, filmWidth * scale, filmHeight * scale);

    // 라벨
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`📦 필름 ${i + 1}`, binX + 5, binY + 20);
  });

  for (const p of allPlacements) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x * scale, p.y * scale, p.width * scale, p.height * scale);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(p.x * scale, p.y * scale, p.width * scale, p.height * scale);
    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${p.id} ${p.height}x${p.width}`, (p.x + p.width / 3) * scale, (p.y + p.height / 2 + 12) * scale);
  }
}