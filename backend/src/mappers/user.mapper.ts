export class UserMapper {
    static toDto(user: any) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt
        };
    }
}
