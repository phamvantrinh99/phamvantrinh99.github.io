using EPiServer.Web.Mvc;
using Microsoft.AspNetCore.Mvc;
using TraditionalMedicalClinic.Cms.Interfaces;
using TraditionalMedicalClinic.Cms.Models.Pages;

namespace TraditionalMedicalClinic.Web.Controllers.Pages.Abstractions
{
    public abstract class TMCControllerBase<T> : PageController<T> where T : TMCBasePage
    {
        public virtual ActionResult Index(T currentPage)
        {
            var viewModel = BuildPageViewModel(currentPage);
            return View(currentPage);
        }

        protected abstract IPageTMCViewModel<T> BuildPageViewModel(T currentPage);
    }
}
