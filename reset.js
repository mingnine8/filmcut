function resetInputs() {
  const container = document.getElementById('parts');
  container.innerHTML = ''; // 기존 조각들 삭제

  const defaultParts = [
    { id: 'A', width: 0, height: 0, count: 0 },
    { id: 'B', width: 0, height: 0, count: 0 },
    { id: 'C', width: 0, height: 0, count: 0 },
    { id: 'D', width: 0, height: 0, count: 0 },
    { id: 'E', width: 0, height: 0, count: 0 },
    { id: 'F', width: 0, height: 0, count: 0 },
    { id: 'G', width: 0, height: 0, count: 0 }
  ];

  const palette = getColorPalette();

  defaultParts.forEach((part, i) => {
    const row = document.createElement('div');
    row.className = 'part-row';
    const color = palette[i % palette.length];
    row.innerHTML = `
      <input type="text" placeholder="ID" value="${part.id}">
      <input type="color" value="${color}">
      <span style="display:inline-block;width:16px;height:16px;background:${color};margin-left:6px;margin-right:6px;"></span>
      <input type="number" placeholder="넓이" value="${part.height}">
      <input type="number" placeholder="길이" value="${part.width}">
      <input type="number" placeholder="개수" value="${part.count}">
    `;
    container.appendChild(row);
  });
}