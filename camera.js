document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById('video');
  const cameraSelect = document.getElementById('cameraSelect');

  async function getCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      cameraSelect.innerHTML = '';
      videoDevices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Camera ${index + 1}`;
        cameraSelect.appendChild(option);
      });

      return videoDevices;
    } catch (err) {
      console.error("Error enumerating devices:", err);
      return [];
    }
  }

  async function startCamera(deviceId) {
    if (window.stream) {
      window.stream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      window.stream = stream;
      video.srcObject = stream;
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }

  cameraSelect.addEventListener('change', () => {
    startCamera(cameraSelect.value);
  });

  // Initialize
  getCameras().then(videoDevices => {
    if (videoDevices.length > 0) {
      startCamera(videoDevices[0].deviceId);
    }
  });
});
