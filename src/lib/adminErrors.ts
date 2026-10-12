/**
 * Maps backend error codes to a specific form field + a helpful message that
 * says what is wrong and how to enter it correctly.
 */
export interface FieldError {
  field: string;
  message: string;
}

export const GAME_ERRORS: Record<string, FieldError> = {
  name_required: {
    field: "name",
    message: "Chưa nhập tên game. Hãy nhập tên hiển thị, ví dụ: Lửa và Nước 1.",
  },
  iframe_required: {
    field: "iframeUrl",
    message:
      "Chưa nhập URL iframe. Dán link nhúng game, ví dụ: https://html5.gamedistribution.com/<id>/",
  },
  iframe_domain_not_allowed: {
    field: "iframeUrl",
    message:
      "Domain chưa được cho phép. Dùng link https từ domain đã duyệt, hoặc thêm domain mới ở mục “Nguồn game”.",
  },
  slug_taken: {
    field: "slug",
    message: "Slug đã tồn tại. Hãy đặt slug khác, ví dụ: lua-va-nuoc-8.",
  },
  slug_invalid: {
    field: "slug",
    message:
      "Slug không hợp lệ. Chỉ dùng chữ thường, số và dấu gạch ngang (vd: red-boy-blue-girl).",
  },
};

export const PAGE_ERRORS: Record<string, FieldError> = {
  title_required: {
    field: "title",
    message: "Chưa nhập H1 (tiêu đề hiển thị). Đây là tiêu đề lớn hiện trên trang.",
  },
  slug_invalid: {
    field: "slug",
    message:
      "Slug không hợp lệ hoặc trùng từ khóa hệ thống (admin, api, tro-choi…). Dùng chữ thường, số, gạch ngang.",
  },
  slug_taken: {
    field: "slug",
    message: "Slug đã tồn tại ở một trang khác. Hãy đổi sang slug khác.",
  },
  slug_taken_by_game: {
    field: "slug",
    message: "Slug đang được một game sử dụng. Hãy chọn slug khác.",
  },
};
