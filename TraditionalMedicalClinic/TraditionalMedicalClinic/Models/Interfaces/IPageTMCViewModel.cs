using TraditionalMedicalClinic.Models.Pages.TMC;

namespace TraditionalMedicalClinic.Models.Interfaces
{
    public interface IPageTMCViewModel<T> where T : TMCBasePage
    {
        T Page { get; }
        IPageTMCLayout Layout { get; }
    }
}