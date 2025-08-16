package com.cxyxh.permission.constant;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
public enum UserStatus {
    NORMAL(0, "启用"),
    DISABLED(1, "禁用"),;

    final int value;
    final String dsc;

    UserStatus(int value, String dsc) {
        this.value = value;
        this.dsc = dsc;
    }
}
