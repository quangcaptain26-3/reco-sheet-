# Release Checklist — RecoSheet 1.0.0

Tài liệu này dành cho lần phát hành đầu tiên. Điền `<username>` và `<repo>` khi bạn
tạo repository GitHub. Không cần biến môi trường, database hay secret.

**Trạng thái hiện tại:** `RELEASED READY 1.0` — chất lượng local đã xanh, container
Docker static đang chạy healthy tại `http://localhost:3000`.

---

## 0. Chuẩn bị

- [ ] Node.js >= 22 (`node -v`)
- [ ] npm >= 10 (`npm -v`)
- [ ] Docker Desktop đang chạy (nếu test Docker)
- [ ] Cổng 3000 trống (hoặc dừng app đang dùng cổng này)
- [ ] Đã có tài khoản GitHub
- [ ] (Tùy chọn) tài khoản Vercel nếu deploy frontend
- [ ] Không có file `.env` chứa secret trong thư mục dự án

---

## 1. Quality gate cuối cùng

Chạy từ thư mục project:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Kỳ vọng hiện tại:

| Lệnh | Kết quả |
| --- | --- |
| `npm run lint` | exit 0, 0 error / 0 warning |
| `npx tsc --noEmit` | exit 0 |
| `npm test` | **59/59 tests pass** |
| `npm run build` | exit 0, route `/` static |

Kiểm tra Docker (nếu phát hành kèm container):

```bash
docker compose up -d --build
docker compose ps
# STATUS phải là healthy
curl -I http://localhost:3000
docker compose down
```

Nếu bất kỳ lệnh nào fail: **dừng**, sửa, chạy lại. Không tag release.

---

## 2. Vệ sinh Git trước khi push

### 2.1 Kiểm tra file không nên commit

```bash
git status --short
git diff --check
```

Phải chắc chắn các mục sau **không** xuất hiện trong commit:

- `node_modules/`
- `.next/`
- `out/`
- `.env`, `.env.local`, file chứa token
- log, screenshot tạm, file cá nhân

`.gitignore` hiện đã bỏ qua `node_modules`, `.next`, `out`, `.env*`, nhưng vẫn nên
xem lại `git status` trước khi `git add`.

### 2.2 Commit đầu tiên

```bash
git branch -M main
git add .
git commit -m "release: RecoSheet 1.0.0"
```

Nếu repo đã có commit trước đó, dùng commit message mô tả phần thay đổi thay vì
message release.

### 2.3 Kiểm tra commit

```bash
git log --oneline -5
git show --stat --oneline HEAD
```

Không commit file `.impeccable/critique/*` nếu bạn không muốn lưu lịch sử đánh giá
nội bộ; `DESIGN.md` và `PRODUCT.md` nên được giữ.

---

## 3. Tạo GitHub repository & push

1. Vào GitHub → **New repository**.
2. Đặt tên, ví dụ `recosheet`.
3. **Không** tick “Add a README”, “Add .gitignore”, “Choose a license” — repo phải
   trống để push code hiện có.
4. Chạy:

```bash
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

Nếu remote đã tồn tại:

```bash
git remote set-url origin https://github.com/<username>/<repo>.git
git push -u origin main
```

### 3.1 Kiểm tra CI

Workflow `.github/workflows/ci.yml` sẽ tự chạy sau push/PR:

```text
npm ci → npm run lint → npm run typecheck → npm test → npm run build
```

- [ ] Tab **Actions** xanh
- [ ] Không có warning bất thường
- [ ] Build log có route `/` static

Nếu CI đỏ, xem log từng bước; sửa local rồi push lại.

---

## 4. Deploy Vercel (khuyến nghị cho frontend)

1. Đăng nhập [vercel.com](https://vercel.com) → **Add New → Project**.
2. Import GitHub repo vừa push.
3. Giữ cấu hình mặc định:
   - Framework preset: **Next.js**
   - Root directory: `./`
   - Build command: `npm run build`
   - Output: mặc định
4. Không thêm Environment Variable.
5. Bấm **Deploy**.

Sau khi có URL:

- [ ] Mở trang chủ, không có lỗi console
- [ ] Upload bộ dữ liệu mẫu
- [ ] Kết quả đúng **8 / 2 / 2 / 2**, Δ `-95.000`
- [ ] Tải báo cáo Excel thành công
- [ ] DevTools → Network: không có POST/PUT chứa dữ liệu tệp
- [ ] Kiểm tra ở 1280px và 1440px

Vercel không cần database hay secret. Nếu dùng custom domain, thêm domain trong
Project Settings → Domains.

---

## 5. Deploy Docker trên VPS (nếu cần self-host)

```bash
git clone https://github.com/<username>/<repo>.git
cd reconciler-app
docker compose up -d --build
docker compose ps
```

- [ ] Container `recosheet` **healthy**
- [ ] `curl -I http://127.0.0.1:3000` trả 200
- [ ] Mở firewall cho 80/443 nếu dùng reverse proxy
- [ ] Đặt nginx/Caddy phía trước để HTTPS; không mở trực tiếp cổng 3000 ra Internet
  nếu không cần

Cập nhật phiên bản:

```bash
git pull
docker compose up -d --build
```

Dừng:

```bash
docker compose down
```

---

## 6. Smoke test sau deploy

Dùng bộ mẫu có sẵn trên web:

- [ ] Upload `sample_internal_ledger.xlsx` vào Tệp A
- [ ] Upload `sample_bank_statement.csv` vào Tệp B
- [ ] Chọn `Mã đơn` ↔ `Mã giao dịch`
- [ ] Chọn `Số tiền` ↔ `Số tiền`
- [ ] Dung sai `0`
- [ ] Bấm **Bắt đầu đối soát**
- [ ] KPI: **8 khớp / 2 lệch / 2 chỉ A / 2 chỉ B**
- [ ] Tổng Δ: **−95.000**
- [ ] Tab “Lệch giá trị” có `ord-101` với Δ `-100.000`
- [ ] Tìm kiếm `107` hoạt động
- [ ] Preview modal mở/đóng bằng Escape, focus không thoát ra ngoài
- [ ] Tải báo cáo Excel: đủ **1 Tổng quan + 4 sheet kết quả**
- [ ] Dòng lệch có nền cam, ô Δ đỏ
- [ ] Network chỉ có GET static; không POST/PUT
- [ ] Console không có error

---

## 7. Tag phiên bản

Sau khi deploy và smoke test xong:

```bash
git tag -a v1.0.0 -m "RecoSheet 1.0.0"
git push origin v1.0.0
```

Tạo GitHub Release từ tag `v1.0.0`, nội dung gợi ý:

```text
RecoSheet 1.0.0
- Đối soát .xlsx/.csv 100% client-side
- Làm sạch khóa, Big.js delta, 4 nhóm kết quả
- Báo cáo Excel 5 sheet
- Zero-server, không API route
- Docker static nginx ~20.7 MB compressed
```

---

## 8. Rollback

### Vercel

Project → Deployments → chọn deployment trước → **Promote to Production**.

### Docker

```bash
git checkout v1.0.0   # hoặc tag/commit ổn định trước đó
docker compose up -d --build
```

Không cần restore database vì app không lưu dữ liệu người dùng.

---

## 9. Việc còn treo (không chặn 1.0)

- Preview modal hiển thị số tiền chưa format `1.000.000` như bảng kết quả.
- Design token `verify/compare/caution/alarm` trong `DESIGN.md` chưa được khai báo
  thành CSS variables; UI đang dùng Tailwind classes.
- Chưa có `LICENSE` — chọn license trước khi public nếu cần.
- Hỗ trợ `.xls` BIFF, composite key, fuzzy matching, 1-nhiều, template, Web Worker
  thuộc roadmap sau.
- Deploy Vercel cần tài khoản/quyền của chủ dự án.

---

## 10. Không làm

- Không `docker system prune -a` trên máy có project khác.
- Không commit `.env`, token, file dữ liệu khách hàng.
- Không thêm API route nhận file — sẽ phá cam kết zero-server.
- Không tự ý đổi tên `RecoSheet` hoặc chuyển UI sang tiếng Anh trong v1.
- Không tag `v1.0.0` trước khi CI và smoke test xanh.
