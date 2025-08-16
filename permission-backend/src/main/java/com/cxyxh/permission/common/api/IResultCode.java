/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.cxyxh.permission.common.api;

/**
 * 结果码接口
 *
 * @author IAM
 */
public interface IResultCode {
    /**
     * 获取结果码
     *
     * @return 结果码
     */
    Integer getCode();

    /**
     * 获取结果消息
     *
     * @return 结果消息
     */
    String getMessage();
} 