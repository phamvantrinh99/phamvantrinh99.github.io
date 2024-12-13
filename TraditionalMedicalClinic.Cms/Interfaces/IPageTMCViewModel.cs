using TraditionalMedicalClinic.Cms.Models.Pages;

namespace TraditionalMedicalClinic.Cms.Interfaces
{
    public interface IPageTMCViewModel<T> where T : TMCBasePage
    {
        T Page { get; }
        IPageTMCLayout Layout { get; }
    }
}
