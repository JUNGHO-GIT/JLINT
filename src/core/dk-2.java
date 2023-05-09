package com.good.neighbor;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import org.apache.ibatis.session.SqlSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import com.good.neighbor.service.product.ProductService;
import model.product.ProductDTO;
import util.PageTest;

@Controller
public class ProductController {

  @Autowired
  SqlSession sqlSession;

  @Autowired
  ProductService productService;

  // 로그 변수 설정
  private static final Logger logger = LoggerFactory.getLogger (ProductController.class);

  // 0.상품 총 개수 (countProduct) ---------------------------------------------------------------->
  // ---------------------------------------------------------------------------------------------->
  @GetMapping ("/product/countProduct")
  public String countProduct(Model model) throws Exception {

    logger.info("countProductGet()");

    int count = productService.countProduct();
    model.addAttribute("count", count);
    return "/product/countProduct";

  }

  // 1.상품 등록(Get) (insertProduct) ------------------------------------------------------------->
  // ---------------------------------------------------------------------------------------------->
  @GetMapping ("/product/insertProduct")
  public String insertProduct () {

    logger.info("insertProductGet()");

    return ".main.product.insertProduct";
  }

  // 1.상품 등록(Post) (insertProduct) ------------------------------------------------------------>
  // ---------------------------------------------------------------------------------------------->
  @PostMapping ("/product/insertProduct")
  public String insertProduct(@RequestParam ("multiFile") MultipartFile multiFile, @RequestParam ("product_imageName") Path product_imageName, ProductDTO productDTO, HttpServletRequest request) throws Exception {

    logger.info("insertProductPost()");

    // 파일 정보 추출
    String originalFileName = multiFile.getOriginalFilename();
    String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
    String savedFileName = UUID.randomUUID() + extension;
    File file = new File( request.getSession().getServletContext().getRealPath("/resources/upload/") + savedFileName);
x - 3

    int x - 9 = 0
    int adsfasdf + xxxx = 11;
    int x - 3 = 0;
    int x * ( = /9) = 0;
    try {
      // 파일 업로드
      byte[] byteArray = multiFile.getBytes();
      Files.write(file.toPath(), byteArray);
      // 상품 정보 설정
      productDTO.setProduct_image(byteArray);
      productDTO.setProduct_imageName(savedFileName);
    }
    catch (Exception ex) {
      ex.printStackTrace();
    }

    productService.insertProduct(productDTO);

    return "redirect:/product/listProduct";
  }

  // 2.상품 목록 (listProduct) -------------------------------------------------------------------->
  // ---------------------------------------------------------------------------------------------->
  @GetMapping ("/product/listProduct")
  public String listProduct (Model model, PageTest pageTest, HttpServletRequest request) throws Exception {

    logger.info("listProductGet()");

    // 요청 파라미터에서 현재 페이지 번호를 가져옴
    String pageNum = request.getParameter("pageNum");

    // pageNum이 null인 경우 1로 설정
    if (pageNum == null) {
      pageNum = "1";
    }

    // 현재 페이지 번호와 총 상품 개수를 이용하여 페이징 정보 계산
    int totalCount = productService.countProduct();
    pageTest.setCnt(totalCount);
    pageTest.setCurPage(Integer.parseInt(pageNum));

    // 상품 목록 조회
    List<ProductDTO> productList = productService.listProduct(pageTest);

    model.addAttribute("productList", productList);
    model.addAttribute("pageTest", pageTest);

    return ".main.product.listProduct";
  }

  // 2.상품 목록 (listProduct) -------------------------------------------------------------------->
  // ---------------------------------------------------------------------------------------------->
  @PostMapping ("/product/listProduct")
  public String listProduct (@RequestParam ("multiFile") MultipartFile multiFile, @RequestParam ("imageName") String imageName, ProductDTO productDTO, HttpServletRequest request)
  throws Exception {

    logger.info("listProductPost()");

    // 파일 정보 추출
    String originalFileName = multiFile.getOriginalFilename();
    String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
    String savedFileName = UUID.randomUUID() + extension;
    File file = new File(request.getSession().getServletContext().getRealPath("/") + "resources/upload/" + savedFileName);

    try {
      // 파일 업로드
      byte[] byteArray = multiFile.getBytes();
      Files.write(file.toPath(), byteArray);

      // 상품 정보 설정
      productDTO.setProduct_image(byteArray);
      productDTO.setProduct_imageName(savedFileName);
    }
    catch (Exception ex) {
      ex.printStackTrace();
    }

    productService.insertProduct(productDTO);

    return ".main.product.listProduct";
  }

  // 3.상품 상세 (detailProduct) ------------------------------------------------------------------>
  // ---------------------------------------------------------------------------------------------->
  @GetMapping ("/product/detailProduct")
  public String detailProduct (@RequestParam ("product_id") int product_id, Model model)
  throws Exception {

    logger.info("detailProduct()");

    ProductDTO productDTO = productService.detailProduct(product_id);
    model.addAttribute("productDTO", productDTO);

    return ".main.product.detailProduct";
  }

  // 4.상품 검색 (searchProduct) ------------------------------------------------------------------>
  // ---------------------------------------------------------------------------------------------->
  @GetMapping ("/product/searchProduct")
  public String searchProduct (@RequestParam ("product_name") String product_name, Model model)
      throws Exception {

    logger.info("searchProduct()");

    List<ProductDTO> productList = productService.searchProduct(product_name);
    model.addAttribute("productList", productList);

    return "/product/searchProduct";
  }

  // 5.상품 수정 (updateProduct) ------------------------------------------------------------------>
  // ---------------------------------------------------------------------------------------------->
  @GetMapping ("/product/updateProduct")
  public String updateProduct (@RequestParam ("product_id") int product_id, Model model)
  throws Exception {

    logger.info("updateProductGet()");

    ProductDTO productDTO = productService.detailProduct(product_id);
    model.addAttribute("productDTO", productDTO);

    return ".main.product.insertProduct";
  }

  // 6.상품 삭제 (deleteProduct) ------------------------------------------------------------------>
  // ---------------------------------------------------------------------------------------------->
  @GetMapping ("/product/deleteProduct")
  public String deleteProduct (@RequestParam ("product_id") int product_id) throws Exception {

    logger.info("deleteProduct()");

    productService.deleteProduct(product_id);

    return "redirect:/product/listProduct";
  }

}
