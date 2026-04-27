using System.Security.Claims;

namespace RecipeApp.API.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public Guid UserId
    {
        get
        {
            var sub = httpContextAccessor.HttpContext?.User.FindFirstValue("sub")
                   ?? httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

            return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
        }
    }
}
