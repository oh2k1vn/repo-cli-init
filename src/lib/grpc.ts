// import 'server-only'

import { transport } from '../grpc/client'
import { BlogServiceClient } from '../grpc/proto/Protos/blog.client'
import { ProductServiceClient } from '../grpc/proto/Protos/product.client'
import { SeoServiceClient } from '../grpc/proto/Protos/seo.client'
import { UserSubmitServiceClient } from '../grpc/proto/Protos/user_submit.client'
import type { CommonQuery, GetBySlugRequest, GetBySlugPagedRequest, Empty } from '../grpc/proto/Protos/common'
import type { GetMetaByUrlRequest, GetSitemapDataRequest } from '../grpc/proto/Protos/seo'
import type { BlogResponse, BlogGroupResponse, BlogGroupResponseWrapped } from '../grpc/proto/Protos/blog'
import type { SubmitRequest } from '../grpc/proto/Protos/user_submit'

// Instantiate raw clients with the custom transport
const rawBlogClient = new BlogServiceClient(transport)
const rawProductClient = new ProductServiceClient(transport)
const rawSeoClient = new SeoServiceClient(transport)
const rawUserSubmitClient = new UserSubmitServiceClient(transport)

// Direct simple wrapping to return the .response promise automatically
export const grpcBlogClient = {
  getByQuery: (req: CommonQuery) => rawBlogClient.getBlogsByQuery(req).response,
  getBySlug: (req: GetBySlugRequest) => rawBlogClient.getBlogDetail(req).response,
  getBlogsByBlogGroupSlug: (req: GetBySlugPagedRequest) => rawBlogClient.getBlogsByBlogGroupSlug(req).response,
  getBlogGroupsBySlug: (req: GetBySlugRequest) => rawBlogClient.getBlogGroupsBySlug(req).response,
  getBlogGroupsByQuery: (req: CommonQuery) => rawBlogClient.getBlogGroupsByQuery(req).response,
}

export const grpcProductClient = {
  getByQuery: (req: CommonQuery) => rawProductClient.getProductsByQuery(req).response,
  getBySlug: (req: GetBySlugRequest) => rawProductClient.getProductDetail(req).response,
  getProductsByProductGroupSlug: (req: GetBySlugPagedRequest) => rawProductClient.getProductsByProductGroupSlug(req).response,
  getProductGroupsBySlug: (req: GetBySlugRequest) => rawProductClient.getProductGroupsBySlug(req).response,
  getProductGroupsByQuery: (req: CommonQuery) => rawProductClient.getProductGroupsByQuery(req).response,
}

export const grpcSeoClient = {
  getGlobalConfig: (req: Empty) => rawSeoClient.getGlobalConfig(req).response,
  getMetaByUrl: (req: GetMetaByUrlRequest) => rawSeoClient.getMetaByUrl(req).response,
  getSitemapData: (req: GetSitemapDataRequest) => rawSeoClient.getSitemapData(req).response,
}

export const grpcUserSubmitClient = {
  submit: (req: SubmitRequest) => rawUserSubmitClient.submit(req).response,
}

export type { BlogResponse, BlogGroupResponse, BlogGroupResponseWrapped }

export { getRelativeSlug } from "./utils";
