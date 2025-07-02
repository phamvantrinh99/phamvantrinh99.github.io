using EPiServer.Framework.DataAnnotations;
using EPiServer.ServiceLocation;
using EPiServer.Web;
using TraditionalMedicalClinic.Models.Interfaces;
using TraditionalMedicalClinic.Models.Pages.TMC;
using TraditionalMedicalClinic.ViewModels.TMC.Pages;
namespace TraditionalMedicalClinic.Controllers.Pages
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