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

# Mock API cho Blood Donation Management

## Tổng quan

File `bloodDonationMock.js` chứa mock data và mock API functions để test UI mà không cần kết nối với backend thật.

## Logic Phân Chia Máu

### Quy tắc Component Blood

Hệ thống áp dụng quy tắc phân chia máu theo component:

1. **Máu toàn phần**: Có thể phân chia thành các component khác
   - Hồng cầu
   - Huyết tương  
   - Tiểu cầu

2. **Component cụ thể**: Chỉ có thể chia thành cùng component đó
   - Hồng cầu → chỉ chia thành Hồng cầu
   - Huyết tương → chỉ chia thành Huyết tương
   - Tiểu cầu → chỉ chia thành Tiểu cầu

### Backend Enum Integration

Sử dụng constants từ backend enum:

```javascript
// /constants/bloodComponents.js
export const BLOOD_COMPONENT = {
  WHOLE: "Máu toàn phần",
  RED_CELLS: "Hồng cầu", 
  PLASMA: "Huyết tương",
  PLATELETS: "Tiểu cầu",
};
```

## Cách sử dụng

### 1. Chuyển sang Mock API

Trong các screen files:

```javascript
// Thay thế real API
// import bloodDonationAPI from "@/apis/bloodDonation";
// import bloodUnitAPI from "@/apis/bloodUnit";

// Sử dụng Mock API
import { mockBloodDonationAPI, mockBloodUnitAPI } from "@/mocks/bloodDonationMock";
```

### 2. Mock Data có sẵn

#### Blood Donations:
- **5 blood donations** với các component khác nhau:
  - **Hồng cầu** (Nguyễn Văn An) - chỉ chia thành Hồng cầu
  - **Máu toàn phần** (Trần Thị Bình) - có thể chia thành tất cả component
  - **Huyết tương** (Lê Minh Cường) - chỉ chia thành Huyết tương
  - **Tiểu cầu** (Phạm Thu Hương) - chỉ chia thành Tiểu cầu
  - **Máu toàn phần** (Hoàng Văn Đức) - có thể chia thành tất cả component

- **3 donations hôm nay** để dễ test
- **Các trạng thái isDivided** khác nhau (true/false)

#### Blood Units:
- **Máu toàn phần đã phân chia** có units đa dạng component
- **Component cụ thể** chưa có units để test tạo mới

### 3. Test Scenarios với Logic Mới

#### Scenario 1: Máu Toàn Phần (Đa Component)
1. Click vào **Trần Thị Bình** (Máu toàn phần, đã phân chia)
2. Thấy 2 units: Huyết tương + Hồng cầu
3. Click "+" → thấy 3 options: Hồng cầu, Huyết tương, Tiểu cầu
4. Có thể tạo unit với bất kỳ component nào

#### Scenario 2: Component Cụ Thể (Đơn Component)
1. Click vào **Nguyễn Văn An** (Hồng cầu, chưa phân chia)
2. Chưa có units → empty state
3. Click "+" → chỉ thấy 1 option: Hồng cầu
4. Chỉ có thể tạo unit Hồng cầu

#### Scenario 3: Huyết tương Component
1. Click vào **Lê Minh Cường** (Huyết tương, 400ml)
2. Click "+" → chỉ thấy: Huyết tương
3. Tạo unit 200ml Huyết tương → thành công

#### Scenario 4: Tiểu cầu Component  
1. Click vào **Phạm Thu Hương** (Tiểu cầu, 300ml)
2. Click "+" → chỉ thấy: Tiểu cầu
3. Tạo unit 150ml Tiểu cầu → thành công

### 4. UI Changes

#### Component Selection Modal
- **Dynamic options** dựa trên donation component
- **Hint text** giải thích quy tắc:
  - "Máu toàn phần có thể phân chia thành các thành phần khác"
  - "Chỉ có thể chia thành: [Component Name]"

#### BloodDonationListScreen
- **Tất cả donation** đều có thể phân chia (không còn disable)
- **Status badge** hiển thị đúng trạng thái

### 5. API Support

#### BloodDonationAPI:
- ✅ `GET /doctor` - Filter theo status và isDivided
- ✅ `GET /{id}` - Chi tiết donation với component info
- ✅ `PATCH /doctor/{id}/mark-divided` - Đánh dấu hoàn thành

#### BloodUnitAPI:  
- ✅ `GET /donation/{donationId}` - Lấy units theo donation
- ✅ `POST /` - Tạo unit với component validation
- **Auto-validation**: Component phải match quy tắc phân chia

### 6. Component Validation

```javascript
// Auto-validation trong mock API
const availableComponents = getAvailableComponents(donation.bloodComponent);
if (!availableComponents.includes(requestedComponent)) {
  throw new Error('Component không hợp lệ cho loại máu này');
}
```

### 7. Mock Data Structure

```javascript
// Blood Donation với component info
{
  bloodComponent: "Máu toàn phần" | "Hồng cầu" | "Huyết tương" | "Tiểu cầu",
  // ... other fields
}

// Blood Unit với component matching
{
  component: "Hồng cầu" | "Huyết tương" | "Tiểu cầu", // Must follow rules
  // ... other fields  
}
```

## Chuyển về Real API

Khi muốn chuyển về real API:

1. **Import thay đổi**:
```javascript
import bloodDonationAPI from "@/apis/bloodDonation";
import bloodUnitAPI from "@/apis/bloodUnit"; 
import { BLOOD_COMPONENT, getAvailableComponents } from "@/constants/bloodComponents";
```

2. **Constants giữ nguyên** - sync với backend enum

3. **Logic validation** được preserve trong real API

## Lưu ý Technical

- **Constants consistency**: bloodComponents.js sync với backend enum
- **Validation rules**: Frontend + backend cùng logic
- **Mock persistence**: Component rules maintained trong session
- **Error handling**: Proper validation messages cho component mismatch

Hệ thống này đảm bảo logic phân chia máu chính xác theo quy tắc y tế và dễ maintain khi scale up.

## Lưu ý

- Mock API có delay 300-500ms để simulate real network
- Mock data sẽ persist trong session (không mất khi refresh)
- Tất cả validation logic được giữ nguyên như real API
- Error handling được simulate với proper error messages 