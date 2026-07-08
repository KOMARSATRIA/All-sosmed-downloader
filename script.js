async function processVideo() {
    const urlInput = document.getElementById('videoUrl').value.trim();
    const loader = document.getElementById('loader');
    const resultBox = document.getElementById('resultBox');
    const downloadBtn = document.getElementById('downloadBtn');
    const videoPreview = document.getElementById('videoPreview');
    const videoPlayer = document.getElementById('videoPlayer'); // Hubungkan elemen player baru

    if (!urlInput) {
        alert('Silakan masukkan link video terlebih dahulu!');
        return;
    }

    // Memunculkan Loading animasi
    loader.style.display = 'block';
    resultBox.style.display = 'none';
    videoPreview.style.display = 'none'; 
    videoPlayer.style.display = 'none'; // Sembunyikan player lama
    videoPlayer.src = ''; // Reset src video lama
    downloadBtn.disabled = true;
    downloadBtn.innerText = 'Memproses...';

    // Data Request POST ke API All-in-One milikmu
    const url = 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': '05c702cf5fmshe05d249d34a2b18p1a1cddjsnad4210e9c7ea',
            'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com'
        },
        body: JSON.stringify({
            url: urlInput
        })
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        console.log("Hasil API:", result);
        
        // Membaca susunan objek 'medias' dari API
        if (result && !result.error && result.medias && result.medias.length > 0) {
            
            // 1. Ambil video kualitas tinggi (hd_no_watermark)
            const hdVideo = result.medias.find(m => m.quality === 'hd_no_watermark' && m.type === 'video');
            const normalVideo = result.medias.find(m => m.quality === 'no_watermark' && m.type === 'video');
            const fallbackVideo = result.medias.find(m => m.type === 'video');
            
            const finalVideoUrl = (hdVideo || normalVideo || fallbackVideo)?.url;

            // 2. Ambil file MP3 audio jika tersedia
            const audioFile = result.medias.find(m => m.type === 'audio' || m.extension === 'mp3');
            const finalAudioUrl = audioFile ? audioFile.url : finalVideoUrl;

            // 3. Pasang data pratinjau gambar jika ada di dalam data API
            if (result.thumbnail) {
                videoPreview.src = result.thumbnail;
                videoPreview.style.display = 'block'; 
            } else {
                videoPreview.style.display = 'none';
            }

            // 4. Masukkan data hasil ke elemen halaman web
            document.getElementById('videoTitle').innerText = result.title || "Video Berhasil Diambil!";
            document.getElementById('hiddenVideoUrl').value = finalVideoUrl || ""; // Simpan di input hidden
            document.getElementById('dlAudio').href = finalAudioUrl || "#";
            
            // Tampilkan kontainer download
            resultBox.style.display = 'block';
        } else {
            alert('Gagal mengekstrak video. Pastikan tautan valid dan didukung!');
        }

    } catch (error) {
        console.error(error);
        alert('Terjadi kendala jaringan saat menghubungi server API.');
    } finally {
        // Matikan efek loading, kembalikan tombol
        loader.style.display = 'none';
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Ambil Video';
    }
}

// Fungsi untuk memutar video langsung di web guna memintas blokir 403 Forbidden
function downloadFile() {
    const videoUrl = document.getElementById('hiddenVideoUrl').value;
    const videoPlayer = document.getElementById('videoPlayer');
    const videoPreview = document.getElementById('videoPreview');
    
    if (!videoUrl) {
        alert("Link video belum siap!");
        return;
    }

    // Tukar tampilan dari gambar pratinjau ke player video asli
    videoPreview.style.display = 'none';
    videoPlayer.src = videoUrl;
    videoPlayer.style.display = 'block';
    videoPlayer.play();
    
    alert("Video dimuat di atas! Ketuk ikon 'titik tiga (...)' di sudut kanan bawah pemutar video lalu klik 'Download' untuk langsung menyimpan .mp4 ke galeri.");
}
