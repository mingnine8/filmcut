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
  constructor(width, height, offsetX = 0) {
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.columns = []; // 각 column은 { x, width, currentY }
    this.usedRects = [];
    this.cursorX = 0; // 새로운 column이 시작될 x 좌표
  }

  insert(rect) {
    // 현재 컬럼이 없거나 현재 컬럼이 높이를 초과하면 새로운 컬럼
    let column = this.columns[this.columns.length - 1];

    if (!column || column.currentY + rect.height > this.height) {
      // 새 컬럼이 width를 넘지 않으면 추가
      if (this.cursorX + rect.width > this.width) return false;

      column = {
        x: this.cursorX,
        width: rect.width,
        currentY: 0
      };
      this.columns.push(column);
      this.cursorX += rect.width;
    }

    // 이 column에 rect 배치
    rect.x = column.x + this.offsetX;
    rect.y = column.currentY;
    column.currentY += rect.height;

    this.usedRects.push(rect);
    return true;
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
    <input type="number" placeholder="가로">
    <input type="number" placeholder="세로">
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
    // 라디오 버튼 값 읽기
    const selectedMode = document.querySelector('input[name="layoutMode"]:checked').value;
    const BinClass = selectedMode === 'vertical' ? SkylineBinVertical : SkylineBin;

    // 유효성 검사 추가 (optimizeAndDraw 함수 내부에서 parts 배열 생성 이후 아래에 삽입)
    for (const row of partRows) {
        const wInput = row.querySelector('input[placeholder="가로"]');
        const hInput = row.querySelector('input[placeholder="세로"]');

        const width = parseInt(wInput.value);
        const height = parseInt(hInput.value);

        if (width > filmWidth) {
            alert(`조각의 가로 (${width})가 필름의 가로 (${filmWidth})보다 큽니다.`);
            wInput.focus();
            return;
        }
        if (height > filmHeight) {
            alert(`조각의 세로 (${height})가 필름의 세로 (${filmHeight})보다 큽니다.`);
            hInput.focus();
            return;
        }
    }

    partRows.forEach(row => {
        const idInput = row.querySelector('input[type="text"]');
        const colorInput = row.querySelector('input[type="color"]');
        const numberInputs = row.querySelectorAll('input[type="number"]');
        const [wInput, hInput, cInput] = numberInputs;
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
    canvas.width = filmWidth * scale;
    canvas.height = 1;

    let allPlacements = [];
    let bins = [];
    let offsetY = 0;

    for (const part of parts) {
        for (let i = 0; i < part.count; i++) {
            const rect = {
                id: part.id,
                width: part.width,
                height: part.height,
                color: part.color
            };

            let placed = false;
            for (let bin of bins) {
                if (bin.insert(rect)) {
                    allPlacements.push(rect);
                    placed = true;
                    break;
                }
            }

            if (!placed) {
                const newBin = new BinClass(filmWidth, filmHeight, offsetY);
                if (newBin.insert(rect)) {
                    bins.push(newBin);
                    allPlacements.push(rect);
                    offsetY += filmHeight;
                } else {
                    console.warn("조각을 배치할 수 없습니다:", rect);
                }
            }
        }
    }

    // canvas 높이 계산 (최댓값 기반)
    if (allPlacements.length === 0) {
        alert("조각이 배치되지 않았습니다. 필름 크기를 늘려보세요.");
        return;
    }

    const maxY = allPlacements.reduce((max, r) => Math.max(max, r.y + r.height), 0);
    canvas.height = Math.ceil(maxY * scale) + 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < bins.length; i++) {
        const y = i * filmHeight * scale;
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`필름 ${i + 1}`, 5, y + 15);
    }

    for (const p of allPlacements) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x * scale, p.y * scale, p.width * scale, p.height * scale);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(p.x * scale, p.y * scale, p.width * scale, p.height * scale);
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.fillText(`${p.width}x${p.height}`, (p.x + p.width / 6) * scale, (p.y + p.height / 2 + 3) * scale);
    }
}
