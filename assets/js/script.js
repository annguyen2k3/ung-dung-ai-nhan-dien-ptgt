// script.js
document.addEventListener("DOMContentLoaded", () => {
    const imageInput = document.getElementById("imageInput");
    const previewImage = document.getElementById("previewImage");
    const analyzeButton = document.getElementById("analyzeButton");
    const outputCanvas = document.getElementById("outputCanvas");
    let model;

    // Tải mô hình COCO-SSD khi trang web khởi động
    async function loadModel() {
        try {
            model = await cocoSsd.load();
            console.log("Mô hình COCO-SSD đã được tải.");
            // Ẩn overlay và kích hoạt nút "Phân tích" sau khi tải xong
            loadingOverlay.classList.add("hidden");
            analyzeButton.disabled = false;
        } catch (error) {
            console.error("Lỗi khi tải mô hình:", error);
            alert("Không thể tải mô hình COCO-SSD. Vui lòng thử lại.");
        }
    }
    loadModel();

    // Hiển thị ảnh xem trước khi người dùng chọn ảnh
    imageInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    });

    // Xử lý khi nhấn nút "Phân tích"
    analyzeButton.addEventListener("click", async () => {
        if (!model) {
            alert("Mô hình đang tải, vui lòng đợi...");
            return;
        }

        if (!previewImage.src) {
            alert("Vui lòng chọn một ảnh trước khi phân tích.");
            return;
        }

        // Tạo đối tượng ảnh để phân tích
        const img = new Image();
        img.src = previewImage.src;
        img.crossOrigin = "anonymous";

        img.onload = async () => {
            // Thiết lập canvas để vẽ kết quả
            const ctx = outputCanvas.getContext("2d");
            outputCanvas.width = img.width;
            outputCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Nhận diện đối tượng bằng COCO-SSD
            const predictions = await model.detect(img);

            console.log(predictions);

            // Danh sách các phương tiện giao thông mà COCO-SSD có thể nhận diện
            const trafficClasses = [
                "car",
                "bus",
                "truck",
                "motorcycle",
                "bicycle",
                "airplane",
                "train",
                "boat",
            ];

            // Thêm phần mapping
            const classToVietnamese = {
                car: "Xe hơi",
                bus: "Xe buýt",
                truck: "Xe tải",
                motorcycle: "Xe máy",
                bicycle: "Xe đạp",
                airplane: "Máy bay",
                train: "Tàu hỏa",
                boat: "Tàu thuyền",
            };

            // Lọc các đối tượng là phương tiện giao thông và vẽ lên canvas
            predictions.forEach((prediction) => {
                if (trafficClasses.includes(prediction.class)) {
                    const [x, y, width, height] = prediction.bbox;

                    // Vẽ khung đỏ xung quanh phương tiện
                    ctx.strokeStyle = "red";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, width, height);

                    // Hiển thị tên phương tiện bên trong khung, góc trên bên trái
                    ctx.fillStyle = "red";
                    ctx.font = "16px Arial";
                    ctx.fillText(
                        classToVietnamese[prediction.class] || prediction.class,
                        x + 5,
                        y + 20
                    ); // Hiển thị trong ô, góc trên bên trái
                }
            });

            // Cuộn trang xuống cuối sau khi phân tích xong
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth", // Cuộn mượt mà
            });
        };
    });
});
