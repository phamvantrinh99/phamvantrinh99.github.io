using EPiServer.Framework.DataAnnotations;
using EPiServer.ServiceLocation;
using EPiServer.Web;
using TraditionalMedicalClinic.Cms.Interfaces;
using TraditionalMedicalClinic.Cms.Models.Pages;
using TraditionalMedicalClinic.Web.ViewModels;
using TraditionalMedicalClinic.Web.ViewModels.Pages;

namespace TraditionalMedicalClinic.Web.Controllers.Pages.Abstractions
{
    public abstract class TMCBasePageController<TPage, TPageViewModel> : TMCControllerBase<TPage>
        where TPage : TMCBasePage
        where TPageViewModel : TMCPageViewModel<TPage>, new()
    {
        protected override IPageTMCViewModel<TPage> BuildPageViewModel(TPage currentPage)
        {
            var contentLoader = ServiceLocator.Current.GetInstance<IContentLoader>();
            var startPage = contentLoader.Get<TMCHomePage>(SiteDefinition.Current.StartPage);
            var settings = contentLoader.Get<TMCSettingsPage>(startPage.SiteSettingsPage);

            var viewModel = new TPageViewModel
            {
                Page = currentPage,
                Layout = BuildPageLayout(settings, currentPage)
            };

            return viewModel;
        }

        protected virtual TMCBasePageLayout BuildPageLayout(TMCSettingsPage settings, TPage currentPage)
        {
            var layout = new TMCBasePageLayout(settings, currentPage);
            return layout;
        }
    }

    public abstract class TMCBasePageController<TPage> : TMCBasePageController<TPage, TMCPageViewModel<TPage>>
    where TPage : TMCBasePage
    {
    }

    [TemplateDescriptor(Inherited = true)]
    public class TMCBasePageController : TMCBasePageController<TMCBasePage>
    {
    }
}
