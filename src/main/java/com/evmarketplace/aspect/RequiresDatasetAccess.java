package com.evmarketplace.aspect;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation đánh dấu các method yêu cầu quyền truy cập/download dataset.
 * Khi method được đánh dấu bởi annotation này, AccessControlAspect sẽ tự động
 * kiểm tra quyền AccessType.DOWNLOAD trước khi cho phép thực thi method.
 * 
 * Sử dụng: @RequiresDatasetAccess
 * Áp dụng cho: Method level
 * Thời gian kiểm tra: Runtime (khi method được gọi)
 */
@Target(ElementType.METHOD) // Chỉ áp dụng cho methods
@Retention(RetentionPolicy.RUNTIME) // Annotation có hiệu lực tại runtime để AOP có thể đọc được
public @interface RequiresDatasetAccess {
}