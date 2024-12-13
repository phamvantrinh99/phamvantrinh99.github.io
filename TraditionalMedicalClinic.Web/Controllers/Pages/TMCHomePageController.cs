using Microsoft.AspNetCore.Mvc;
using TraditionalMedicalClinic.Cms.Models.Pages;
using TraditionalMedicalClinic.Web.Controllers.Pages.Abstractions;

namespace TraditionalMedicalClinic.Web.Controllers.Pages
{
    public class TMCHomePageController : TMCBasePageController<TMCHomePage>
    {
        public TMCHomePageController()
        {
            var a = "123";
        }
    }
}
