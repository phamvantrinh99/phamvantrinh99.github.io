using TraditionalMedicalClinic.Models.Interfaces;
using TraditionalMedicalClinic.Models.Pages.TMC;

namespace TraditionalMedicalClinic.ViewModels.TMC.Pages
{
    public class TMCBasePageLayout : IPageTMCLayout
    {
        public TMCSettingsPage Settings { get; set; }
        public string ScriptsWithinTheHeadTag { get; set; }
        public string ScriptsAfterOpeningBodyTag { get; set; }
        public string ScriptsBeforeClosingBodyTag { get; set; }
        public string MetaDataWithinTheHeadTag { get; set; }
        public string BrowserTitle { get; set; }
        public string Keywords { get; set; }
        public string Description { get; set; }
        public string ExtendedMetaTags { get; set; }
        public ContentReference OpenGraphImage { get; set; }
        public bool DisableIndexing { get; set; }
        public ContentReference Logo { get; set; }
        public string FrontendBuildVersion { get; set; }
        public TMCBasePageLayout() { }
        public TMCBasePageLayout(TMCSettingsPage settings, TMCBasePage currentPage)
        {
            Settings = settings;
            ScriptsWithinTheHeadTag = settings?.ScriptsWithinTheHeadTag;
            ScriptsAfterOpeningBodyTag = settings?.ScriptsAfterOpeningBodyTag;
            ScriptsBeforeClosingBodyTag = settings?.ScriptsBeforeClosingBodyTag;

            MetaDataWithinTheHeadTag = settings?.MetaDataWithinTheHeadTag;
            BrowserTitle = currentPage.BrowserTitle ?? currentPage.Name;
            Keywords = currentPage.Keywords;
            Description = currentPage.MetaDescription;
            OpenGraphImage = currentPage.OpenGraphImage;
            DisableIndexing = currentPage.DisableIndexing;
            Logo = settings.Logo;
            FrontendBuildVersion = settings?.FrontendBuildVersion;
        }
    }
}