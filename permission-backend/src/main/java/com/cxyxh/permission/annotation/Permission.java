package com.cxyxh.permission.annotation;

import org.springframework.core.annotation.AliasFor;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@PreAuthorize(value = "")
public @interface Permission {
    /**
     * 权限表达式（同@PreAuthorize value）
     */
    @AliasFor(annotation = PreAuthorize.class, attribute = "value")
    String value();

    /**
     * 中文权限说明
     */
    String description() default "";

    /**
     * 权限分类（如：用户管理）
     */
    String category() default "默认分类";
}
