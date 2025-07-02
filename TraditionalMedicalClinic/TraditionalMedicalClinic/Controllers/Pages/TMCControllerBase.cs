using EPiServer.Web.Mvc;
using Microsoft.AspNetCore.Mvc;
using TraditionalMedicalClinic.Models.Interfaces;
using TraditionalMedicalClinic.Models.Pages.TMC;

namespace TraditionalMedicalClinic.Controllers.Pages
{
    public abstract class TMCControllerBase<T> : PageController<T> where T : TMCBasePage
    {
        public virtual ActionResult Index(T currentPage)
        {
            var viewModel = BuildPageViewModel(currentPage);
            return View(viewModel);
        }

        protected abstract IPageTMCViewModel<T> BuildPageViewModel(T currentPage);
    }
}