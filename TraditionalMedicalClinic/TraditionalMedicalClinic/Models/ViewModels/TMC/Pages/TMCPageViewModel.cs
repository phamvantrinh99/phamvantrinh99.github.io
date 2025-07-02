using TraditionalMedicalClinic.Models.Interfaces;
using TraditionalMedicalClinic.Models.Pages.TMC;

namespace TraditionalMedicalClinic.ViewModels.TMC.Pages
{
    public class TMCPageViewModel<T> : IPageTMCViewModel<T> where T : TMCBasePage
    {
        public T Page { get; set; }
        public IPageTMCLayout Layout { get; set; }
    }
}