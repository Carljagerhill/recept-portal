using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeApp.API.DTOs;
using RecipeApp.API.Services;

namespace RecipeApp.API.Controllers;

[ApiController]
[Route("api/units")]
[Authorize]
public class UnitsController(UnitConversionService converter) : ControllerBase
{
    [HttpGet("convert")]
    public ActionResult<UnitConversionResultDto> Convert(
        [FromQuery] decimal value,
        [FromQuery] string from,
        [FromQuery] string to)
    {
        if (!converter.CanConvert(from, to))
            return BadRequest($"Cannot convert between '{from}' and '{to}'.");

        try
        {
            var result = converter.Convert(value, from, to);
            return Ok(new UnitConversionResultDto(value, from, Math.Round(result, 4), to));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    public ActionResult<IEnumerable<string>> GetAll() => Ok(UnitConversionService.AllUnits());
}
