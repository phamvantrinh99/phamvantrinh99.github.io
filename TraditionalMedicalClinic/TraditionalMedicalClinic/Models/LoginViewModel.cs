using System.ComponentModel.DataAnnotations;

namespace TraditionalMedicalClinic.Models;

public class LoginViewModel
{
    [Required]
    public string Username { get; set; }

    [Required]
    public string Password { get; set; }
}
