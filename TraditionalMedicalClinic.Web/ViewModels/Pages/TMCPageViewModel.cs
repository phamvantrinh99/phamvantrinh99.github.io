using TraditionalMedicalClinic.Cms.Interfaces;
using TraditionalMedicalClinic.Cms.Models.Pages;

namespace TraditionalMedicalClinic.Web.ViewModels.Pages
{
    public class TMCPageViewModel<T> : IPageTMCViewModel<T> where T : TMCBasePage
    {
        public T Page { get; set; }
        public IPageTMCLayout Layout { get; set; }
    }
}
