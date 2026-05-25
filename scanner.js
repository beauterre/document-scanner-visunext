let selection = null; // {x, y, width, height} in canvas coords
let canvas = null;
let ctx = null;
let video = null;
document.addEventListener("DOMContentLoaded", () => {
  video = document.getElementById("video");
  canvas = document.getElementById("preview");
  ctx = canvas.getContext("2d");

  const setScanAreaBtn = document.getElementById("set_scan_area");
  const clearScanAreaBtn = document.getElementById("clear_scan_area");

  let selecting = false;
  
  let isDragging = false;
  let startX = 0, startY = 0, endX = 0, endY = 0;

  function drawRotatedVideo() {
    if (video.readyState >= 2) {
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      // Resize canvas to match rotated dimensions
      if (canvas.width !== vh || canvas.height !== vw) {
        canvas.width = vh;
        canvas.height = vw;
      }

      // Draw rotated video
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2); // 90° clockwise
      ctx.drawImage(video, -vw / 2, -vh / 2, vw, vh);
      ctx.restore();

      // Draw scan area if set
      if (selection) {
		  console.log("showing selection "+selection);
        const { x, y, width, height } = selection;
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
      }
    }

    requestAnimationFrame(drawRotatedVideo);
  }

  video.addEventListener("loadeddata", () => {
    drawRotatedVideo();
  });

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  };
}
  // Scan area logic
  canvas.addEventListener("mousedown", (e) => {
  if (!selecting) return;
  isDragging = true;
  const pos = getMousePos(e);
  startX = pos.x;
  startY = pos.y;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const pos = getMousePos(e);
  endX = pos.x;
  endY = pos.y;

  // Live preview of selection box
  selection = {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY)
  };
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  selecting = false;

  
});

  // Button handlers
   setScanAreaBtn.addEventListener("click", () => {
    selecting = true;
    selection = null;
  });

  clearScanAreaBtn.addEventListener("click", () => {
    selection = null;
    selecting = false;
  });
});
// today
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("doc_date");
  const todayBtn = document.getElementById("today");


  function setToday() {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }

  // Set date to today on page load
  setToday();

  // Set date to today on button click
  todayBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setToday();
    dateInput.focus();
  });
});
// save
document.addEventListener("DOMContentLoaded", () => {
	
	


	const downloadBtn = document.getElementById("download_as_png");
	const lastScan = document.getElementById("last_scan");
	lastScan.width=210;
	lastScan.height=297;// show A4 size ratio..
	function formatToday() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function autoNextPage()
{
	console.log("autoNextPage");
	const pageInput = document.getElementById('page');
	 const bookMode = document.getElementById('bookmode').checked;
	 let page = Number(pageInput?.value.trim());
	 console.log("currentPage:"+page)
	page++;
	if(bookMode) page++; // even odd.
	pageInput.value=page;
	 console.log("pageInput.value=:"+page)
 

}
	function generateFilename() {
  const categorySelect = document.getElementById('basecategory');
  const basenameInput = document.getElementById('basename');
  const dateInput = document.getElementById('doc_date');
  const pageInput = document.getElementById('page');
  const nrofPagesInput = document.getElementById('nrofpages');
  // pad to nr of pages

  const category = categorySelect ? categorySelect.value.trim() : 'Varia';
  const basename = basenameInput && basenameInput.value.trim() !== '' ? basenameInput.value.trim() : 'scan';
  const dateRaw = dateInput ? dateInput.value : '';

  // Format date as YYYY-MM-DD or fallback to today
  let dateStr = '';
  if (dateRaw) {
    const dateObj = new Date(dateRaw);
    if (!isNaN(dateObj)) {
      dateStr = dateObj.toISOString().slice(0, 10);
    }
  }
  if (!dateStr) {
    dateStr = new Date().toISOString().slice(0, 10);
  }

  // Sanitize strings
  const safeCategory = category.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  const safeBasename = basename.replace(/\s+/g, '_').replace(/[^\w-]/g, '');

  // Page info (optional)
	let page = pageInput?.value.trim().padStart(4, '0');
  let nrofPages = nrofPagesInput?.value.trim().padStart(4, '0');
  if(page<=0) page=null;
  if(nrofPages<=0) nrofPages=null;
  let pagePart = '';
  if (page && nrofPages && !isNaN(page) && !isNaN(nrofPages)) {
    pagePart = `-p${page}of${nrofPages}`;
  }
  return `${safeCategory}-${dateStr}-${safeBasename}${pagePart}.png`;
}

	
	downloadBtn.addEventListener("click", () => {
	  if (!canvas) {
		alert("Canvas not found!");
		return;
	  }


  const lastScanCtx = lastScan.getContext("2d");

  let sx, sy, sw, sh;

  if (selection) {
    // Extract from video, accounting for 90° rotation
    sx = selection.x;
    sy = selection.y;
    sw = selection.width;
    sh = selection.height;

    // Resize preview canvas
    lastScan.width = sw-3;
    lastScan.height = sh-3;

    // Clear and draw selected region from live video
    lastScanCtx.clearRect(0, 0, sw, sh);
    lastScanCtx.drawImage(canvas, sx, sy, sw, sh, -1.5, -1.5, sw, sh);
  } else {
    // No selection: just use entire rotated canvas
    lastScan.width = canvas.width;
    lastScan.height = canvas.height;

    lastScanCtx.clearRect(0, 0, canvas.width, canvas.height);
    lastScanCtx.drawImage(canvas, 0, 0);
  }
  
  // Trigger download
  lastScan.toBlob((blob) => {
    if (blob) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = generateFilename();
	  
	  const filename = generateFilename();
const dateStr = new Date().toISOString().slice(0, 10);

// Update UI
document.getElementById("last_scan_name").textContent = filename;
document.getElementById("last_scan_date").textContent = dateStr;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); // Clean up
    } else {
      alert("Failed to create image blob.");
    }
  }, "image/png");
	  
	  
	   // make pagenr one (or two) higher if nrofPages >0
  let pageInput = document.getElementById('page');

  let nrofPagesInput = document.getElementById('nrofpages');
  let page = Number(pageInput?.value.trim());
    console.log("nrofPagesInput.value"+nrofPagesInput.value);
  let nrofPages = Number(nrofPagesInput.value.trim());
  console.log("nrofPages"+pageInput+"/nrofPages:"+nrofPages);
  
  if(nrofPages>0)
  {
	   setTimeout(autoNextPage,300);
  }
	});
	
 
});

document.getElementById("guess_scan_area").addEventListener("click", () => {
	console.log("started guess")
  const canvas = document.getElementById("preview");
  const ctx = canvas.getContext("2d");
	const width = canvas.width;
  const height = canvas.height;

  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Helper: get grayscale at pixel (x, y)
  function getGray(x, y) {
    const i = (y * width + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return 0.299 * r + 0.587 * g + 0.114 * b; // Luma
  }

  // 1. Sample corners (you could sample edges too)
  const corners = [
    getGray(0, 0),
    getGray(width - 1, 0),
//    getGray(0, height - 1),
 //   getGray(width - 1, height - 1)
  ];
  const avgCornerGray = corners.reduce((sum, val) => sum + val, 0) / corners.length;

	console.log("avgCornerGray"+avgCornerGray);

  // 2. Threshold to consider "bright"
  const brightnessThreshold = avgCornerGray + 80+100*Math.random(); // tweak as needed
	console.log("brightnessThreshold"+brightnessThreshold);

  // 3. Find all pixels brighter than threshold
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const gray = getGray(x, y);
      if (gray > brightnessThreshold) {
        found = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (found) {
    const w = maxX - minX;
    const h = maxY - minY;
    selection = { x: minX, y: minY, width:w, height:h };
    console.log("Guessed bright area:", selection);
  } else {
    console.warn("No bright area found.");
    selection = null;
  }

});

