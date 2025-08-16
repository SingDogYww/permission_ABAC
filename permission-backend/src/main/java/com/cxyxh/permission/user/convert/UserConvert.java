package com.cxyxh.permission.user.convert;

import com.cxyxh.permission.user.dto.UserDTO;
import com.cxyxh.permission.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserConvert {


    UserConvert INSTANCE = Mappers.getMapper(UserConvert.class);

    @Mapping(target = "updateTime", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "createTime", ignore = true)
    User dtoToEntity(UserDTO userDTO);


    /**
     * User 转 UserVO
     *
     * @param user 用户实体
     * @return 用户VO
     */
    UserDTO entityToVO(User user);


    /**
     * User 列表转 UserVO 列表
     *
     * @param userList 用户实体列表
     * @return 用户VO列表
     */
    List<UserDTO> entityListToVOList(List<User> userList);

    /**
     * 状态转换为状态名称
     *
     * @param status 状态值
     * @return 状态名称
     */
    @Named("statusToName")
    default String statusToName(Integer status) {
        return status != null && status == 1 ? "正常" : "禁用";
    }
}
