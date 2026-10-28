# TÀI LIỆU YÊU CẦU SẢN PHẨM (PRODUCT REQUIREMENTS DOCUMENT)
## Dự án: Smart Sheet Reconciler (RecoSheet)
**Phiên bản:** 1.0 (MVP Specification)  
**Định dạng sản phẩm:** Client-Side Web Application (Single-Page App)  
**Mục tiêu vibe coding:** Xây dựng nhanh trong 1–2 ngày bằng AI-assisted coding (Cursor, Claude Code, Lovable/v0).

---

## 1. Mục tiêu & Chân dung người dùng mục tiêu

### 1.1 Mục tiêu sản phẩm
Cung cấp một công cụ web tức thì (zero-install, zero-login), cho phép người dùng kéo thả 2 bảng tính bất kỳ (Excel/CSV) để tự động đối soát, làm sạch dữ liệu bẩn và bóc tách các điểm sai lệch về mã hoặc số tiền trong vòng vài giây với độ bảo mật tuyệt đối (xử lý hoàn toàn trong trình duyệt).

### 1.2 Chân dung người dùng mục tiêu (User Persona)
* **Persona 1 - Kế toán thanh toán & Đối soát công nợ (Reconciliation Specialist)**:
  * *Bối cảnh*: Cuối ngày/cuối tháng phải đối chiếu file sao kê ngân hàng hoặc hóa đơn nhà cung cấp với sổ quỹ nội bộ.
  * *Nỗi đau*: Mã thanh toán bị dư dấu cách, viết hoa thường lộn xộn, hoặc sai định dạng khiến hàm `VLOOKUP`/`XLOOKUP` bị lỗi `#N/A`. Phải dò mắt thủ công từng dòng.
* **Persona 2 - Chuyên viên vận hành sàn Thương mại Điện tử / Bán hàng**:
  * *Bối cảnh*: Đối soát danh sách đơn hàng xuất từ hệ thống bán lẻ với file báo cáo chuyển tiền của đơn vị vận chuyển (GHN, Viettel Post, Shopee, TikTok Shop).
  * *Nỗi đau*: Số tiền đối soát bị lệch do phí vận chuyển, khuyến mãi, phí sàn; khó phát hiện đơn nào bị trừ sai nếu chỉ nhìn tổng tiền.
* **Persona 3 - Điều vận & Chứng từ Logistics / Xuất nhập khẩu (Logistics Ops)**:
  * *Bối cảnh*: Đối chiếu danh sách số container, số seal, phí cước lưu kho/bãi giữa bảng kê của hãng tàu/cảng với danh sách theo dõi nội bộ.
  * *Nỗi đau*: Dữ liệu từ các bên gửi đến không đồng nhất về quy chuẩn đặt tên và khoảng trắng.

---

## 2. User Journey / Luồng trải nghiệm người dùng (Workflow)

```
[1. Upload Files] ──> [2. Cấu hình Mapping] ──> [3. Thực thi & Đối soát] ──> [4. Xem & Tải báo cáo]
 (Kéo thả File A & B)   (Chọn Cột Khóa & Giá trị)    (Chuẩn hóa + So khớp ngầm)    (Interactive UI + Excel)
```

1. **Giai đoạn 1: Tải tệp (Upload)**:
   * Người dùng truy cập trang web, thấy ngay 2 vùng kéo thả trực quan: **Tệp A (Nguồn đối chiếu)** và **Tệp B (Nguồn so sánh)**.
   * Hỗ trợ định dạng `.xlsx`, `.xls`, `.csv`. 
   * Trình duyệt đọc file ngay tại máy người dùng và hiển thị preview 3–5 dòng đầu tiên kèm số lượng dòng/cột.
2. **Giai đoạn 2: Cấu hình thông số đối soát (Configuration & Mapping)**:
   * Chọn sheet cần đối chiếu (nếu file có nhiều sheet).
   * Chọn **Cột định danh (Key Column)** ở File A và File B (ví dụ: `Mã đơn`, `Số hóa đơn`, `Mã giao dịch`).
   * Chọn **Cột giá trị đối chiếu (Value Column)** ở File A và File B (tùy chọn, ví dụ: `Số tiền`, `Số lượng`).
   * Tùy chọn nâng cao:
     * *Dung sai chênh lệch (Tolerance)*: Cho phép lệch $\pm X$ đơn vị (mặc định = 0).
     * *Chế độ làm sạch thông minh*: Tự động xóa khoảng trắng ẩn (`TRIM`), chuẩn hóa không phân biệt hoa/thường, loại bỏ ký tự gạch nối/dấu chấm.
3. **Giai đoạn 3: Thực thi & Trực quan hóa kết quả (Execution & Diff Dashboard)**:
   * Bấm nút **"Bắt đầu đối soát"**.
   * Hệ thống xử lý trong 1–3 giây và hiển thị thẻ tóm tắt (Summary Cards):
     * Tổng số dòng phân tích.
     * Số dòng khớp hoàn toàn (100% Match).
     * Số dòng khớp mã nhưng lệch giá trị (Value Discrepancy) kèm tổng tiền chênh lệch.
     * Số dòng chỉ có trong File A (Thiếu ở B).
     * Số dòng chỉ có trong File B (Thiếu ở A).
4. **Giai đoạn 4: Bộ lọc chi tiết & Xuất dữ liệu (Filter & Export)**:
   * Bảng hiển thị có 4 tab tương ứng. Dòng lệch giá trị được tô màu cảnh báo (màu cam/đỏ) ở cột chênh lệch.
   * Bấm **"Tải báo cáo đối soát (.xlsx)"**: Xuất 1 file Excel hoàn chỉnh chứa 4 sheet kết quả kèm định dạng rõ ràng để gửi cho sếp hoặc đối tác.

---

## 3. Các chức năng chính (Core Features)

### 3.1 Trình xử lý tệp Client-Side (Local File Parsing)
* Đọc nhanh file Excel/CSV bằng thư viện JavaScript tối ưu (`xlsx` / `SheetJS` hoặc `PapaParse`).
* Không đẩy dữ liệu lên server, đảm bảo tính bảo mật và tốc độ tức thì.
* Tự động nhận diện kiểu dữ liệu (ngày tháng, chuỗi ký tự, tiền tệ/số).

### 3.2 Bộ chuẩn hóa dữ liệu thông minh (Smart Data Normalizer)
* **Auto-Trim & Sanitize**: Cắt bỏ khoảng trắng thừa đầu, cuối và giữa chuỗi (khắc phục 90% lỗi `#N/A` của VLOOKUP truyền thống).
* **Case-Insensitive Match**: So khớp không phân biệt chữ hoa, chữ thường (`ORD-123` = `ord-123`).
* **Number Parser**: Tự động nhận diện và bóc tách số tiền có chứa dấu phẩy/chấm ngăn cách hàng nghìn hoặc ký hiệu tiền tệ (`1,500,000 đ` $\rightarrow$ `1500000`).

### 3.3 Thuật toán đối soát theo khóa (Keyed Reconciliation Engine)
* So sánh 1-1 giữa hai danh sách dựa trên khóa chính.
* Tính toán trường chênh lệch: $\Delta = \text{Giá trị B} - \text{Giá trị A}$.
* Hỗ trợ cài đặt ngưỡng dung sai số học (Tolerance Threshold).

### 3.4 Bảng xem kết quả tương tác (Interactive Result Grid)
* Bộ lọc phân loại 4 trạng thái rõ ràng.
* Tìm kiếm nhanh (Search/Filter) theo từ khóa trên bảng kết quả.
* Highlight trực quan các ô có sự sai lệch.

### 3.5 Bộ xuất báo cáo Excel hoàn chỉnh (Export Engine)
* Tạo tệp `.xlsx` có cấu trúc:
  * Sheet 1: Tổng quan đối soát (Summary Report, ngày giờ thực hiện, số lượng lệch).
  * Sheet 2: Danh sách lệch giá trị (kèm cột chênh lệch $\Delta$).
  * Sheet 3: Danh sách chỉ có ở File A.
  * Sheet 4: Danh sách chỉ có ở File B.
  * Sheet 5: Danh sách khớp hoàn toàn.

---

## 4. Phạm vi MVP & Các hạng mục trì hoãn

### 4.1 Phạm vi MVP (Làm ngay trong đợt vibe code đầu tiên)
* [x] Hỗ trợ tải 2 file Excel (`.xlsx`) hoặc `.csv`.
* [x] Đọc dữ liệu từ sheet đầu tiên của mỗi file.
* [x] Cho phép chọn 1 cột khóa chính (Single Key) và 1 cột so sánh giá trị số.
* [x] Tự động bật chế độ làm sạch chuỗi (Trim, lowercase, bỏ ký tự đặc biệt thừa).
* [x] Dashboard tóm tắt 4 số liệu cốt lõi (Khớp, Lệch tiền, Thiếu ở A, Thiếu ở B).
* [x] Xuất file Excel tổng hợp kết quả 4 tab.
* [x] 100% Client-side xử lý trong trình duyệt.

### 4.2 Hạng mục trì hoãn (Deferred - Phase 2 & 3)
* [ ] **Composite Key**: Ghép nhiều cột thành một khóa duy nhất (ví dụ: `Ngày giao dịch` + `Số chứng từ`).
* [ ] **Fuzzy String Matching**: So khớp mờ tên đối tác/công ty bằng thuật toán Levenshtein/Dice Coefficient khi tên bị viết tắt nhẹ.
* [ ] **Xử lý quan hệ 1-Nhiều**: Đối soát khi 1 mã đơn thanh toán thành 2-3 đợt tiền mặt nhỏ.
* [ ] **Lưu hồ sơ mẫu (Saved Templates)**: Lưu cấu hình mapping cột vào `localStorage` của trình duyệt để lần sau mở lên không cần chọn lại cột.
* [ ] **Web Worker / DuckDB-WASM**: Xử lý tệp siêu lớn (>200.000 dòng) trên nền ngầm để tránh giật lag trình duyệt.

---

## 5. Yêu cầu phi chức năng (Non-Functional Requirements)

### 5.1 Bảo mật & Quyền riêng tư (Security & Privacy) - Ưu tiên cao nhất
* **Zero Server Storage**: Dữ liệu tài chính, sao kê, đơn hàng không được tải lên bất kỳ máy chủ nào. Toàn bộ logic chạy trên RAM của trình duyệt.
* Không theo dõi (tracking) nội dung file của người dùng; chỉ lưu trữ cấu hình UI tạm thời.

### 5.2 Hiệu năng (Performance)
* Khởi động trang web trong < 1.5 giây.
* Thời gian parse và so khớp dữ liệu cho file có 10.000 dòng: < 2 giây.
* Tệp có 50.000 dòng: < 6 giây.
* Giao diện không bị đóng băng khi tính toán nhờ chia nhỏ batch tính toán hoặc Web Worker.

### 5.3 Khả năng tương thích (Compatibility)
* Hoạt động trơn tru trên các trình duyệt hiện đại: Chrome, Edge, Safari, Firefox.
* Giao diện Responsive tối ưu cho màn hình máy tính bàn và laptop (độ phân giải từ 1280px trở lên).

### 5.4 Độ tin cậy (Reliability & Accuracy)
* Đảm bảo độ chính xác số học 100% trong phép trừ chênh lệch (tránh lỗi floating-point trong JavaScript bằng cách làm tròn số chuẩn hoặc dùng thư viện xử lý số thập phân).

---

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)

* **AC-01 (Tải tệp & Hiển thị)**: Khi người dùng kéo thả 1 file `.xlsx` và 1 file `.csv`, hệ thống đọc thành công trong vòng 2 giây và dropdown hiển thị chính xác tên tất cả các cột của 2 file.
* **AC-02 (Chuẩn hóa khóa)**: Khóa `ORD-001 ` ở File A phải khớp chính xác với `ord-001` ở File B khi bật chế độ làm sạch tự động.
* **AC-03 (Phát hiện lệch giá trị)**: Với khóa trùng nhau nhưng File A có giá trị `1,000,000` và File B có giá trị `950,000`, hệ thống phải xếp dòng này vào tab "Lệch giá trị" và ghi nhận chênh lệch `-50,000`.
* **AC-04 (Xử lý dòng thiếu)**: Các dòng có ở File A nhưng mã khóa không xuất hiện ở File B phải được tách riêng vào tab "Chỉ có ở File A" và ngược lại.
* **AC-05 (Xuất báo cáo Excel)**: File Excel xuất ra phải mở được trên Microsoft Excel phiên bản desktop và Google Sheets mà không báo lỗi định dạng hay hỏng file.

---

## 7. Giả định, Rủi ro tiềm ẩn & Câu hỏi còn mở

### 7.1 Giả định (Assumptions)
* Người dùng có ít nhất một cột thông tin có tính định danh phân biệt được dòng (ID, Mã hóa đơn, Số vận đơn).
* Hầu hết nhu cầu đối soát hàng ngày của người dùng văn phòng nằm trong quy mô dưới 30.000 dòng dữ liệu.

### 7.2 Rủi ro tiềm ẩn (Risks)
* **Khóa trùng lặp (Duplicate Keys trong cùng 1 file)**: Nếu trong File A có 2 dòng cùng mang mã `ORD-001`, thuật toán so khớp 1-1 đơn giản sẽ gán sai hoặc cộng dồn thiếu.  
  * *Biện pháp giảm thiểu*: Hệ thống tự phát hiện và cảnh báo "File của bạn có X mã trùng lặp" ngay khi chọn cột khóa.
* **Định dạng số thập phân/phẩy**: Một số file dùng dấu phẩy cho thập phân (`1.000,50`), số khác dùng dấu chấm (`1,000.50`).  
  * *Biện pháp giảm thiểu*: Thêm bộ chuyển đổi auto-detect format số.

### 7.3 Câu hỏi còn mở (Open Questions)
1. Người dùng có cần xuất kết quả ngược lại bằng cách bổ sung thêm cột vào chính 2 file gốc hay chỉ cần 1 file báo cáo mới hoàn toàn? (MVP mặc định xuất 1 file báo cáo mới có 4 tab).
2. Quy mô dữ liệu tối đa mà bạn thường đối soát là bao nhiêu dòng?

---

## 8. Hướng dẫn Vibe Coding tiếp theo (Handoff & Next Steps)

Khi đưa tài liệu này vào công cụ vibe coding (Cursor, Claude Code, Lovable, v0), bạn có thể dùng prompt khởi tạo sau:
> *"Tôi muốn xây dựng một web app Single-Page chạy client-side bằng React, Tailwind CSS, Lucide Icons và SheetJS (xlsx) theo tài liệu PRODUCT-REQUIREMENTS.md. Hãy tạo giao diện chính gồm vùng upload 2 file Excel, dropdown chọn cột mapping và bảng hiển thị 4 nhóm kết quả đối soát."*

Kỹ năng kiến trúc và kỹ thuật đề xuất tiếp theo:
1. `technology-stack-advisor`: Chốt cấu trúc thư viện tối giản (Next.js vs Vite React + SheetJS).
2. `project-scaffolding`: Khởi tạo khung dự án và cài đặt dependencies.
3. `implementation-orchestrator`: Chia nhỏ các giai đoạn code từ UI Upload đến Engine tính toán.
