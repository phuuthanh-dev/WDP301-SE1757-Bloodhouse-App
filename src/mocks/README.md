# Mock Data cho Doctor Screens

## Tổng quan

File `doctorMockData.js` chứa dữ liệu mẫu đẹp và đầy đủ cho tất cả các màn hình doctor trong ứng dụng. Mock data này được thiết kế để:

- Hiển thị giao diện đẹp với dữ liệu thực tế
- Mô phỏng các API calls với delay thực tế
- Cung cấp dữ liệu đa dạng cho testing và demo

## Cấu trúc Mock Data

### 1. Health Checks (`mockHealthChecks`)
- 5 bản ghi khám sức khỏe với các trạng thái khác nhau
- Bao gồm: chờ khám, đủ điều kiện, không đủ điều kiện
- Dữ liệu đầy đủ: thông tin bệnh nhân, chỉ số sinh hiệu, ghi chú

### 2. Blood Donations (`mockBloodDonations`)
- 4 lần hiến máu đã xác nhận
- Bao gồm thông tin người hiến, nhóm máu, số lượng
- Mỗi donation có thể có nhiều blood units

### 3. Blood Units (`mockBloodUnits`)
- 5 đơn vị máu với các trạng thái khác nhau
- Bao gồm: pending, approved, expired
- Thông tin chi tiết: thành phần máu, thể tích, hạn sử dụng

### 4. Donors (`mockDonors`)
- 8 người hiến máu với thông tin đa dạng
- Các trạng thái: active, inactive, banned
- Nhóm máu đa dạng: A+, B+, O+, AB+, A-, B-, O-, AB-

### 5. Donation History (`mockDonationHistory`)
- Lịch sử hiến máu của các donors
- Thông tin cơ sở y tế, ngày hiến, số lượng

### 6. Health Records (`mockHealthRecords`)
- Hồ sơ sức khỏe của donors
- Chỉ số sinh hiệu, tình trạng sức khỏe

## Mock API Functions

### `mockHealthCheckAPI`
```javascript
// GET /doctor - Lấy danh sách health checks
// GET /registration/{id} - Lấy thông tin registration và health check
// GET /{id} - Lấy chi tiết health check
// PATCH /{id} - Cập nhật health check
```

### `mockBloodDonationAPI`
```javascript
// GET / - Lấy danh sách blood donations
// GET /{id} - Lấy chi tiết donation
// GET /blood-units/{id} - Lấy chi tiết blood unit
// POST /blood-units - Tạo blood unit mới
// PATCH /blood-units/{id} - Cập nhật blood unit
```

### `mockDonorAPI`
```javascript
// GET /donors - Lấy danh sách donors
// GET /donors/{id} - Lấy chi tiết donor với history và health records
```

## Cách sử dụng

### 1. Import mock API
```javascript
import { mockHealthCheckAPI, mockBloodDonationAPI, mockDonorAPI } from '@/mocks/doctorMockData';
```

### 2. Thay thế API calls
```javascript
// Thay vì:
// const response = await healthCheckAPI.HandleHealthCheck(endpoint, data, method);

// Sử dụng:
const response = await mockHealthCheckAPI.HandleHealthCheck(endpoint, data, method);
```

### 3. Sử dụng helper functions
```javascript
import { getMockDataByDate, filterByStatus, searchByName } from '@/mocks/doctorMockData';

// Lọc theo ngày
const todayData = getMockDataByDate(mockHealthChecks, 'checkDate', new Date());

// Lọc theo trạng thái
const activeData = filterByStatus(mockDonors, 'status', 'active');

// Tìm kiếm theo tên
const searchResults = searchByName(mockDonors, 'Nguyễn');
```

## Màn hình đã được cập nhật

1. **HealthCheckListScreen** - Hiển thị danh sách khám sức khỏe
2. **HealthCheckUpdateScreen** - Cập nhật thông tin khám sức khỏe
3. **BloodDonationListScreen** - Danh sách hiến máu
4. **BloodUnitSplitScreen** - Quản lý chia đơn vị máu
5. **BloodUnitUpdateScreen** - Cập nhật đơn vị máu
6. **DonorListScreen** - Danh sách người hiến
7. **DonorDetailScreen** - Chi tiết người hiến

## Đặc điểm Mock Data

### Dữ liệu thực tế
- Tên người Việt Nam
- Địa chỉ TP.HCM thực tế
- Số điện thoại đúng format
- Email hợp lệ

### Đa dạng trạng thái
- Health checks: chờ khám, đủ điều kiện, không đủ điều kiện
- Blood units: pending, approved, rejected, expired, used
- Donors: active, inactive, banned

### Thời gian thực tế
- Sử dụng `date-fns` để tạo ngày tháng
- Hiện tại, hôm qua, tuần trước
- Hạn sử dụng máu thực tế (35-365 ngày)

### Avatar đẹp
- Sử dụng `https://i.pravatar.cc/` cho avatar
- Mỗi user có avatar riêng biệt

## Chuyển đổi sang API thật

Khi cần chuyển sang API thật, chỉ cần:

1. Uncomment import API thật
2. Comment import mock API
3. Thay đổi function calls

```javascript
// Từ:
import { mockHealthCheckAPI } from '@/mocks/doctorMockData';
const response = await mockHealthCheckAPI.HandleHealthCheck(endpoint, data, method);

// Thành:
import healthCheckAPI from '@/apis/healthCheckAPI';
const response = await healthCheckAPI.HandleHealthCheck(endpoint, data, method);
```

## Lưu ý

- Mock API có delay 500ms để mô phỏng network request
- Dữ liệu được lưu trong memory, sẽ reset khi reload app
- Các thao tác CRUD sẽ cập nhật mock data trong session hiện tại
- Phù hợp cho development, testing và demo 